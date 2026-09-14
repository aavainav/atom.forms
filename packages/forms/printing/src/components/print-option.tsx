import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { FButton, FIcon, FTooltip, IControllerManager, IModalOptions } from "@forms/core";

import { PrintDialog } from "./print-dialog";
import { IPrintRequest, IPrintService } from "../services";

/**
 * Defines the props the print option is rendered with. Declared here rather than imported so that nothing in this
 * package depends on whoever renders it: the dialog is opened through a `showModal` handed in, and a failure goes
 * out through `onError`, both of which belong to the host of the option rather than to the option.
 */
export interface IPrintOptionProps {
    /** The catalog item the form was loaded from, which its printable copies are resolved by. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form being printed. */
    readonly controllers: IControllerManager;
    /** The name the option is offered under, shown as its tooltip. */
    readonly title: string;
    /** Opens a modal at the root of whatever is hosting this option - never inside the options bar, which is a stacking context. */
    readonly showModal: (options: IModalOptions) => void;
    /** Invoked when the report cannot be printed. */
    readonly onError?: (message: string) => void;
}

/** Defines the option for printing the current report as one of the copies the form publishes. */
export const PrintOption = ({ catalogItem, controllers, title, showModal, onError }: IPrintOptionProps): React.JSX.Element => {
    const printService = useService<IPrintService>(IPrintService);

    const print = async (request: IPrintRequest): Promise<void> => {
        try {
            await printService.print(controllers, catalogItem, request);
        }
        catch (error) {
            onError?.(error instanceof Error ? error.message : "The report could not be printed.");
        }
    };

    const showDialog = (): void => {
        // the copies are read when the dialog opens rather than held here, since the service is the registry and a
        // form's copies are registered before any of this renders
        const profiles = printService.getProfiles(catalogItem);

        // the modal's actions are handed over when it opens, so they cannot re-render with the dialog's state; the
        // dialog reports each choice back into this instead, and the print action reads whatever it last held
        let request: IPrintRequest = { profileId: profiles[0]?.id ?? "", layout: profiles[0]?.layout ?? "top-down" };

        // the dialog is shown through the handed-in showModal rather than rendered here, so that it lands at the
        // root of the report viewer instead of inside the options bar. the bar is fixed positioned, which makes it
        // a stacking context, and a modal rendered inside one is painted under the backdrop appended to the body.
        showModal({
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
        <FTooltip title={title} placement="top">
            <FButton id="print-button" variant="light" type="button" onClick={showDialog}>
                <FIcon icon="printer" />
            </FButton>
        </FTooltip>
    );
}
