import React from "react";
import { useService } from "@common/react";
import { getAuditController } from "@forms/audit";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IModalService, INotificationService, IReportViewerOptionProps, IReportViewerService } from "../../services";

/** Defines the option for resetting the current form to a blank instance, applying whatever defaults the data manager supplies for a new record. */
export const NewFormOption = ({ catalogItem, controllers, dataManager, title }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const startNew = async (): Promise<void> => {
        try {
            const { form } = await reportViewerService.loadForm({ name: catalogItem.name, version: catalogItem.version }, dataManager, "new");
            controllers.getFormController().setForm(form);
        }
        catch (error) {
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The new form could not be started." });
        }
    };

    const handleNewForm = async (): Promise<void> => {
        const form = controllers.getFormController().form;

        if (!form.getIsDirty()) {
            await startNew();
            return;
        }

        if (!reportViewerService.canSaveForm(form, dataManager)) {
            modalService.showConfirmModal({
                title: "Start a new form?",
                message: "Any unsaved changes on this form will be lost.",
                confirmText: "Start new",
                onCancel: async () => {},
                onConfirm: startNew
            });
            
            return;
        }

        modalService.showSaveChangesModal({
            title: "Start a new form?",
            message: "You have unsaved changes. You can save them, discard them and start a new form, or cancel to keep editing.",
            onCancel: async () => {},
            onDiscard: startNew,
            onSave: async () => {
                try {
                    await reportViewerService.saveForm(form, dataManager);
                }
                catch (error) {
                    getAuditController(controllers).recordSaveFailed();
                    throw error;
                }

                getAuditController(controllers).recordSaved();
                controllers.getFormController().update(current => current.clean());
                await startNew();
            }
        });
    };

    return (
        <FTooltip title={title} placement="top">
            <FButton id="new-form-button" variant="light" type="button" onClick={handleNewForm}>
                <FIcon icon="file-earmark-plus" />
            </FButton>
        </FTooltip>
    );
};
