import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { IReportDataTab, ReportDataDialog } from "./report-data-dialog";
import { IModalService, INotificationService, IReportViewerOptionProps, IReportViewerService } from "../../services";

/** Defines the option for viewing the data held about the current report: what it would be saved as, its audit history, its review comments, its workflow history, and all of it together. */
export const ReportDataOption = ({ controllers, title }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const copy = async (tab: IReportDataTab): Promise<void> => {
        try {
            await navigator.clipboard.writeText(tab.json);
            notificationService.showNotification({ type: "success", message: `${tab.title} copied.` });
        }
        catch (error) {
            // the browser can refuse clipboard access outright, and a copy button that silently did nothing would
            // read as broken rather than as denied
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : `${tab.title} could not be copied.` });
        }
    };

    const showDialog = (): void => {
        // the form controller owns the current model and replaces it on every edit, so it is read at click time
        const bundle = reportViewerService.getBundle(controllers.getFormController().form, controllers);
        const format = (value: unknown): string => JSON.stringify(value, null, 2);

        const tabs: ReadonlyArray<IReportDataTab> = [
            { id: "data", title: "Report data", json: format(bundle.data) },
            { id: "audit", title: "Audit history", json: format(bundle.audit) },
            { id: "comments", title: "Comments", json: format(bundle.comments) },
            // a form with no workflow has no history to show, and the tab would only be empty
            ...(bundle.data.workflow ? [{ id: "workflow", title: "Workflow", json: format(bundle.data.workflow) }] : []),
            // the whole bundle, as a host is handed it by `writeBundle`
            { id: "all", title: "All data", json: format(bundle) }
        ];

        // the modal's actions are handed over when it opens, so they cannot re-render with the dialog's state; the
        // dialog reports the tab it is on back into this instead, and the copy action reads whichever it last held
        let active = tabs[0];

        // the dialog is shown through the modal service rather than rendered here, so that it lands at the root of
        // the report viewer instead of inside the options bar. the bar is fixed positioned, which makes it a
        // stacking context, and a modal rendered inside one is painted under the backdrop appended to the body.
        modalService.showModal({
            title: "Report data",
            content: ReportDataDialog,
            contentProps: { tabs, onChange: (tab: IReportDataTab) => { active = tab; } },
            size: "xl",
            close: { invoke: async () => ({ result: true }) },
            actions: [
                {
                    title: "Copy",
                    // only a true result closes the modal, so copying leaves the data on screen to copy again
                    invoke: async () => {
                        await copy(active);
                        return { result: false };
                    }
                },
                { title: "Close", primary: true, invoke: async () => ({ result: true }) }
            ]
        });
    };

    return (
        <FTooltip title={title} placement="top">
            <FButton id="report-data-button" variant="light" type="button" onClick={showDialog}>
                <FIcon icon="braces" />
            </FButton>
        </FTooltip>
    );
}
