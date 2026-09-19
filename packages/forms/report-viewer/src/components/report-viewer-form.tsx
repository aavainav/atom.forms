import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from "react";
import { useService } from "@common/react";
import { useFormController, IControllerManager, ControllerManager, IReportData, IRuleIssue } from "@forms/core";

import { ModalManager } from "./modal";
import { NotificationManager } from "./notification";
import { PanelManager } from "./panel";
import { ReportViewerOptions } from "./report-viewer-options";
import { ValidationManager } from "./validation";
import { IInitialForm, IModalService, INotificationService, IReportViewerDataManager, IReportViewerService } from "../services";

/**
 * The imperative surface a host can reach through a ref on `ReportViewer`/`ReportViewerForm`, for the handful of
 * things that don't fit as a prop. Every member here is a pure read -- none of them change what the user sees --
 * so a host can call any of them just to ask a question, with no risk of a surprising side effect.
 */
export interface IReportViewerComponent {
    /** Gets whether the form can currently be saved, which it can once it carries a mapper and the data manager can write. */
    canSave(): boolean;
    /** Extracts the form's current data through its own mapper, without persisting any of it. */
    extractData(): IReportData;
    /** Whether the form's data differs from what it held the last time it was loaded or saved. */
    getIsDirty(): boolean;
    /** Runs the form's validation rules and returns the issues found, without changing anything the user sees. */
    validate(): ReadonlyArray<IRuleIssue>;
}

interface IReportViewerFormProps {
    /** The controllers to use for the form; when omitted a set is created and owned here. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
    readonly initialForm: IInitialForm;
    /** Where the form's data goes when it is saved. Without one the save option is not offered. */
    readonly dataManager?: IReportViewerDataManager<any>;
    readonly isReadOnly: boolean;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
}

/**
 * Renders a loaded form, owning the controllers that drive it. `ReportViewer` renders this after resolving and
 * loading the form itself; a host needing shared controllers or a mutation of the loaded model calls
 * `IReportViewerService.loadForm` and renders this directly, so both paths wire a form up identically.
 */
export const ReportViewerForm = forwardRef<IReportViewerComponent, IReportViewerFormProps>(function ReportViewerForm({ controllers, initialForm, dataManager, isReadOnly, showOptions }, ref) {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const ownedControllers = useMemo(() => controllers ? undefined : new ControllerManager(), [controllers, initialForm]);
    const formControllers = controllers ?? ownedControllers!;

    const initialState = useMemo(() => isReadOnly ? initialForm.form.setReadOnly() : initialForm.form, [initialForm, isReadOnly]);

    const controller = useFormController(formControllers, initialState);

    useImperativeHandle(ref, () => ({
        canSave: () => reportViewerService.canSaveForm(controller.form, dataManager),
        extractData: () => reportViewerService.extractData(controller.form),
        getIsDirty: () => controller.form.getIsDirty(),
        validate: () => {
            const rulesController = formControllers.getRulesController();
            rulesController.validate();

            return rulesController.getIssueCollection().getIssues();
        }
    }), [controller, dataManager, formControllers, reportViewerService]);

    const confirmDeletePage = useCallback(() => new Promise<boolean>(resolve =>
        modalService.showConfirmModal({
            message: "Are you sure you want to delete this page?",
            onCancel: async () => resolve(false),
            onConfirm: async () => resolve(true)
        })), [modalService]);

    // the options and panels imported from below this package report a failure by calling back rather than by
    // reaching for a notification service, since the notifications belong to whoever is hosting them
    const onError = useCallback((message: string) => notificationService.showNotification({ type: "danger", message }), [notificationService]);

    useEffect(() => {
        controller.setConfirmDeletePage(confirmDeletePage);
        return () => controller.setConfirmDeletePage(undefined);
    }, [controller, confirmDeletePage]);

    return (
        <>
            <ModalManager />
            <NotificationManager />
            <ValidationManager controllers={formControllers} />
            <PanelManager catalogItem={initialForm.catalogItem} controllers={formControllers} onError={onError} />
            <initialForm.Component controllers={formControllers} isReadOnly={isReadOnly} />
            {showOptions && (
                <ReportViewerOptions
                    catalogItem={initialForm.catalogItem}
                    controllers={formControllers}
                    dataManager={dataManager}
                    onError={onError}
                />
            )}
        </>
    );
});
