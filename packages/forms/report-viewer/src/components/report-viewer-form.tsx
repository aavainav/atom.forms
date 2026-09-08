import React, { useCallback, useEffect, useMemo } from "react";
import { useService } from "@common/react";
import { useFormController, IControllerManager, ControllerManager } from "@forms/core";

import { ModalManager } from "./modal";
import { NotificationManager } from "./notification";
import { ReportViewerOptions } from "./report-viewer-options";
import { ValidationManager } from "./validation";
import { IInitialForm, IModalService } from "../services";

interface IReportViewerFormProps {
    /** The controllers to use for the form; when omitted a set is created and owned here. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
    readonly initialForm: IInitialForm;
    readonly isReadOnly: boolean;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
}

/** Renders a loaded form, owning the controllers that drive it. Both the report viewer and the report viewer panel render this, so the two wire a form up identically. */
export function ReportViewerForm({ controllers, initialForm, isReadOnly, showOptions }: IReportViewerFormProps): React.JSX.Element {
    const modalService = useService<IModalService>(IModalService);

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

    useEffect(() => {
        controller.setConfirmDeletePage(confirmDeletePage);
        return () => controller.setConfirmDeletePage(undefined);
    }, [controller, confirmDeletePage]);

    return (
        <>
            <ModalManager />
            <NotificationManager />
            <ValidationManager />
            <initialForm.Component controllers={formControllers} isReadOnly={isReadOnly} />
            {showOptions && <ReportViewerOptions catalogItem={initialForm.catalogItem} controllers={formControllers} />}
        </>
    );
}
