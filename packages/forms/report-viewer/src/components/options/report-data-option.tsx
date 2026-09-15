import React from "react";
import { useService } from "@common/react";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { ReportDataDialog } from "./report-data-dialog";
import { IModalService, INotificationService, IReportViewerOptionProps, IReportViewerService } from "../../services";

/** Defines the option for viewing the data the current report would be saved as. */
export const ReportDataOption = ({ controllers, title }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const copy = async (json: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(json);
            notificationService.showNotification({ type: "success", message: "Report data copied." });
        }
        catch (error) {
            // the browser can refuse clipboard access outright, and a copy button that silently did nothing would
            // read as broken rather than as denied
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The report data could not be copied." });
        }
    };

    const showDialog = (): void => {
        // the form controller owns the current model and replaces it on every edit, so it is read at click time
        const form = controllers.getFormController().form;
        const json = JSON.stringify(reportViewerService.extractData(form), null, 2);

        // the dialog is shown through the modal service rather than rendered here, so that it lands at the root of
        // the report viewer instead of inside the options bar. the bar is fixed positioned, which makes it a
        // stacking context, and a modal rendered inside one is painted under the backdrop appended to the body.
        modalService.showModal({
            title: "Report data",
            content: ReportDataDialog,
            contentProps: { json },
            size: "xl",
            close: { invoke: async () => ({ result: true }) },
            actions: [
                {
                    title: "Copy",
                    // only a true result closes the modal, so copying leaves the data on screen to copy again
                    invoke: async () => {
                        await copy(json);
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
