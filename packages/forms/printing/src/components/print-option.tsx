import React from "react";
import { useService } from "@common/react";
import { IModalService, INotificationService, IReportViewerOptionProps } from "@forms/report-viewer";
import { FButton, FIcon, FTooltip } from "@forms/core";

import { PrintDialog } from "./print-dialog";
import { IPrintRequest, IPrintService } from "../services";

/** Defines the option for printing the current report as one of the copies the form publishes. */
export const PrintOption = ({ catalogItem, controllers }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const printService = useService<IPrintService>(IPrintService);

    const print = async (request: IPrintRequest): Promise<void> => {
        try {
            await printService.print(controllers, catalogItem, request);
        }
        catch (error) {
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The report could not be printed." });
        }
    };

    const showDialog = (): void => {
        // the copies are read when the dialog opens rather than held here, since the service is the registry and a
        // form's copies are registered before any of this renders
        const profiles = printService.getProfiles(catalogItem);

        // the modal's actions are handed over when it opens, so they cannot re-render with the dialog's state; the
        // dialog reports each choice back into this instead, and the print action reads whatever it last held
        let request: IPrintRequest = { profileId: profiles[0]?.id ?? "", layout: profiles[0]?.layout ?? "top-down" };

        // the dialog is shown through the modal service rather than rendered here, so that it lands at the root of
        // the report viewer instead of inside the options bar. the bar is fixed positioned, which makes it a
        // stacking context, and a modal rendered inside one is painted under the backdrop appended to the body.
        modalService.showModal({
            title: "Print report",
            content: PrintDialog,
            contentProps: {
                initial: request,
                profiles,
                onChange: (updated: IPrintRequest) => { request = updated; }
            },
            close: { invoke: async () => ({ result: true }) },
            actions: [
                { title: "Cancel", invoke: async () => ({ result: true }) },
                {
                    title: "Print",
                    primary: true,
                    invoke: async () => {
                        // the print is not awaited here: the modal closes on the result, and printing has to wait
                        // for the dialog to leave the page before the browser is handed the sheets
                        void print(request);
                        return { result: true };
                    }
                }
            ]
        });
    };

    return (
        <FTooltip title="Print" placement="top">
            <FButton id="print-button" variant="light" type="button" onClick={showDialog}>
                <FIcon icon="printer" />
            </FButton>
        </FTooltip>
    );
}
