import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { TemplatePicker } from "./template-picker";
import { IModalService, INotificationService, IReportTemplate, IReportViewerOptionProps, IReportViewerService } from "../../services";

/** What a new form is to start from. */
interface IChoice {
    /** The template picked; undefined starts from the form's own default. */
    readonly template?: string;
}

/**
 * Defines the option for resetting the current form to a blank instance, applying whatever defaults the data manager
 * supplies for a new record. A host that offers templates has the user pick one first.
 */
export const NewFormOption = ({ catalogItem, controllers, dataManager, title }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    /** Finds out what to start from, asking the user only when there is more than one thing to start from. Undefined when they cancelled. */
    const chooseTemplate = async (): Promise<IChoice | undefined> => {
        let templates: ReadonlyArray<IReportTemplate>;

        try {
            templates = await dataManager?.readTemplates?.() ?? [];
        }
        catch {
            notificationService.showNotification({ type: "danger", message: "The templates could not be loaded." });
            return undefined;
        }

        // the host's default replaces the form's own, so the form's own is on offer only when the host names none
        const selected = templates.find(entry => entry.isDefault)?.id;
        const hasDefault = selected !== undefined;

        if (templates.length === 0) {
            return {};
        }

        if (hasDefault && templates.length === 1) {
            return { template: selected };
        }

        let chosen = selected;

        return new Promise(resolve => {
            modalService.showModal({
                title: "Start a new form",
                content: TemplatePicker,
                contentProps: { includeBlank: !hasDefault, selected, templates, onChange: (id?: string) => { chosen = id; } },
                actions: [
                    { title: "Cancel", invoke: async () => { resolve(undefined); return { result: true }; } },
                    { title: "Start", primary: true, invoke: async () => { resolve({ template: chosen }); return { result: true }; } }
                ],
                close: { invoke: async () => { resolve(undefined); return { result: true }; } },
                persistent: true
            });
        });
    };

    const startNew = async (template?: string): Promise<void> => {
        try {
            const loaded = await reportViewerService.loadForm({ name: catalogItem.name, version: catalogItem.version }, dataManager, "new", template);

            reportViewerService.openForm(controllers, loaded);
        }
        catch (error) {
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The new form could not be started." });
        }
    };

    const handleNewForm = async (): Promise<void> => {
        const choice = await chooseTemplate();

        // cancelling the picker leaves the form as it is, without asking about its changes
        if (!choice) {
            return;
        }

        const start = (): Promise<void> => startNew(choice.template);
        const form = controllers.getFormController().form;

        if (!form.getIsDirty()) {
            await start();
            return;
        }

        if (!reportViewerService.canSaveForm(form, dataManager)) {
            modalService.showConfirmModal({
                title: "Start a new form?",
                message: "Any unsaved changes on this form will be lost.",
                confirmText: "Start new",
                onCancel: async () => {},
                onConfirm: start
            });

            return;
        }

        modalService.showSaveChangesModal({
            title: "Start a new form?",
            message: "You have unsaved changes. You can save them, discard them and start a new form, or cancel to keep editing.",
            onCancel: async () => {},
            onDiscard: start,
            onSave: async () => {
                await reportViewerService.save(controllers, dataManager);
                await start();
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
