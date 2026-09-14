import React, { useCallback, useEffect, useMemo } from "react";
import { useService } from "@common/react";
import { useFormController, IControllerManager, ControllerManager } from "@forms/core";

import { ModalManager } from "./modal";
import { NotificationManager } from "./notification";
import { PanelManager } from "./panel";
import { ReportViewerOptions } from "./report-viewer-options";
import { ValidationManager } from "./validation";
import { IDataManager, IInitialForm, IModalService, INotificationService } from "../services";

interface IReportViewerFormProps {
    /** The controllers to use for the form; when omitted a set is created and owned here. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
    readonly initialForm: IInitialForm;
    /** Where the form's data goes when it is saved. Without one the save option is not offered. */
    readonly dataManager?: IDataManager<any>;
    readonly isReadOnly: boolean;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
}

/**
 * Renders a loaded form, owning the controllers that drive it. `ReportViewer` renders this after resolving and
 * loading the form itself; a host needing shared controllers or a mutation of the loaded model calls
 * `IReportViewerService.loadForm` and renders this directly, so both paths wire a form up identically.
 */
export function ReportViewerForm({ controllers, initialForm, dataManager, isReadOnly, showOptions }: IReportViewerFormProps): React.JSX.Element {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);

    const ownedControllers = useMemo(() => controllers ? undefined : new ControllerManager(), [controllers, initialForm]);
    const formControllers = controllers ?? ownedControllers!;

    const initialState = useMemo(() => isReadOnly ? initialForm.form.setReadOnly() : initialForm.form, [initialForm, isReadOnly]);

    const controller = useFormController(formControllers, initialState);

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
            <ValidationManager />
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
}
