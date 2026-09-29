import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { useService } from "@common/react";
import { EventEmitter, IEvent } from "@common/event-emitter";
import { useAuditRecorder } from "@forms/audit";
import { 
    emptyPreferences, 
    useFormController, 
    userPreferenceSchema, 
    IActor, 
    IControllerManager, 
    IReportData, 
    IRuleIssue, 
    IUserPreferences, 
    ControllerManager, 
    FormMode 
} from "@forms/core";

import { ModalManager } from "./modal";
import { NotificationManager } from "./notification";
import { PanelManager } from "./panel";
import { ReportViewerOptions } from "./report-viewer-options";
import { ReviewManager } from "./review";
import { ValidationManager } from "./validation";
import { WorkflowActions } from "./workflow";
import { useAuditWriter } from "../hooks";
import { IInitialForm, ILocalStorageService, IModalService, INotificationService, IReportBundle, IReportViewerDataManager, IReportViewerService } from "../services";

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
    /** Gathers everything held about the report -- its data, the audit history and the review comments -- into one object, without persisting any of it. */
    getBundle(): IReportBundle;
    /** Whether the form's data differs from what it held the last time it was loaded or saved. */
    getIsDirty(): boolean;
    /** Runs the form's validation rules and returns the issues found, without changing anything the user sees. */
    validate(): ReadonlyArray<IRuleIssue>;

    /** Raised whenever a feature changes the current user's preferences, and once on load with the initial value. Given a `preferences` value, persisting the update is the host's own responsibility; without one, it fires alongside the default save to the browser's own storage. */
    readonly onPreferencesChanged: IEvent<IUserPreferences>;
}

interface IReportViewerFormProps {
    /** The controllers to use for the form; when omitted a set is created and owned here. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
    /** Where the form's data goes when it is saved. Without one the save option is not offered. */
    readonly dataManager?: IReportViewerDataManager<any>;
    /** Describes a form resolved from the form catalog and ready to render. */
    readonly initialForm: IInitialForm;
    /** The mode with which the form is being viewed in. */
    readonly mode: FormMode;
    /** The current user's own settings. Without one, they're loaded from and saved to the browser's own storage, keyed by `user`'s id. Given one, it is used as-is and never written back here -- persisting a later change is the host's own responsibility. */
    readonly preferences?: IUserPreferences;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
    /** Who is using the report: the audit records and the review comments are attributed to them. A reviewable form without one shows its comments but cannot add any. */
    readonly user?: IActor;
}

/**
 * Renders a loaded form, owning the controllers that drive it. `ReportViewer` renders this after resolving and
 * loading the form itself; a host needing shared controllers or a mutation of the loaded model calls
 * `IReportViewerService.loadForm` and renders this directly, so both paths wire a form up identically.
 */
export const ReportViewerForm = forwardRef<IReportViewerComponent, IReportViewerFormProps>(function ReportViewerForm({ controllers, initialForm, dataManager, mode, preferences, showOptions, user }, ref) {
    const localStorageService = useService<ILocalStorageService>(ILocalStorageService);
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const ownedControllers = useMemo(() => controllers ? undefined : new ControllerManager(), [controllers, initialForm]);
    const formControllers = controllers ?? ownedControllers!;

    const initialState = useMemo(() => mode === "editable" ? initialForm.form : initialForm.form.setMode(mode), [initialForm, mode]);

    // set before the form loads, since the audit records the form being opened as it is loaded
    formControllers.setUser(user);
    // and how it arrived, which the audit says of it in place of a plain opening
    formControllers.setArrival(reportViewerService.getArrival(initialForm));

    const controller = useFormController(formControllers, initialState);

    const preferencesChanged = useMemo(() => new EventEmitter<IUserPreferences>("report-viewer-form:preferences-changed"), []);

    // what the host held for the report goes in before paint and before any writer subscribes, once for each form it
    // is given; not during render, since a mounted component subscribed to the comments would be updated mid-render
    useLayoutEffect(() => {
        reportViewerService.restoreHistory(formControllers, initialForm);
    }, [formControllers, initialForm, reportViewerService]);

    // handles reading preferences from a local storage and the emitting any changes so hosts can get any updates.
    useLayoutEffect(() => {
        const key = `report-viewer:preferences:${user?.id ?? "anonymous"}`;
        let isCurrent = true;

        if (preferences) {
            formControllers.setPreferences(preferences);
        } else {
            localStorageService.read(key, userPreferenceSchema).then(stored => {
                if (isCurrent) {
                    formControllers.setPreferences(stored ?? emptyPreferences);
                }
            });
        }

        const listener = formControllers.onPreferencesChanged(updated => {
            if (!updated) {
                return;
            }

            preferencesChanged.emit(updated);

            if (!preferences) {
                localStorageService.write(key, updated, userPreferenceSchema);
            }
        });

        return () => {
            isCurrent = false;
            listener.remove();
        };
    }, [formControllers, localStorageService, preferences, preferencesChanged, user?.id]);

    useAuditRecorder(formControllers);

    useImperativeHandle(ref, () => ({
        canSave: () => reportViewerService.canSaveForm(controller.form, dataManager),
        extractData: () => reportViewerService.extractData(controller.form),
        getBundle: () => reportViewerService.getBundle(controller.form, formControllers),
        getIsDirty: () => controller.form.getIsDirty(),
        validate: () => {
            const rulesController = formControllers.getRulesController();
            rulesController.validate();

            return rulesController.getIssueCollection().getIssues();
        },
        onPreferencesChanged: preferencesChanged.event
    }), [controller, dataManager, formControllers, preferencesChanged, reportViewerService]);

    const confirmDeletePage = useCallback(() => new Promise<boolean>(resolve =>
        modalService.showConfirmModal({
            message: "Are you sure you want to delete this page?",
            onCancel: async () => resolve(false),
            onConfirm: async () => resolve(true)
        })), [modalService]);

    // the options and panels imported from below this package report a failure by calling back rather than by
    // reaching for a notification service, since the notifications belong to whoever is hosting them
    const onError = useCallback((message: string) => notificationService.showNotification({ type: "danger", message }), [notificationService]);

    useAuditWriter(formControllers, dataManager, onError);

    useEffect(() => {
        controller.setConfirmDeletePage(confirmDeletePage);
        return () => controller.setConfirmDeletePage(undefined);
    }, [controller, confirmDeletePage]);

    return (
        <>
            <ModalManager />
            <NotificationManager />
            <ValidationManager controllers={formControllers} />
            <PanelManager catalogItem={initialForm.catalogItem} controllers={formControllers} dataManager={dataManager} onError={onError} />
            {reportViewerService.canReview(initialState, dataManager) && (
                <ReviewManager controllers={formControllers} dataManager={dataManager} onError={onError} />
            )}
            <WorkflowActions controllers={formControllers} dataManager={dataManager} user={user} />
            <initialForm.Component controllers={formControllers} />
            {showOptions && (
                <ReportViewerOptions
                    catalogItem={initialForm.catalogItem}
                    controllers={formControllers}
                    dataManager={dataManager}
                    onError={onError}
                    user={user}
                />
            )}
        </>
    );
});
