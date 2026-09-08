import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { FButton, FIcon, FTooltip, IControllerManager } from "@forms/core";

import { INotificationService, IReportViewerService } from "../../services";

interface ISaveOptionProps {
    /** The catalog item the form was loaded from; it resolves the mapper that extracts the data and carries the identity the saved data is stamped with. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form being saved. */
    readonly controllers: IControllerManager;
}

/** Defines the option for saving the current report through the data writer the host registered. */
export const SaveOption = ({ catalogItem, controllers }: ISaveOptionProps): React.JSX.Element => {
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    // the same route context the form was loaded under, so a sink can identify the record it is writing back to
    const params = useParams();
    const [searchParams] = useSearchParams();

    const handleSave = async (): Promise<void> => {
        // the form controller owns the current model and replaces it on every edit, so it is read at click time
        const form = controllers.getFormController().form;

        try {
            await reportViewerService.saveForm(form, catalogItem, { params, searchParams });
            notificationService.showNotification({ type: "success", message: "Report saved." });
        }
        catch (error) {
            notificationService.showNotification({ type: "danger", message: error instanceof Error ? error.message : "The report could not be saved." });
        }
    };

    return (
        <FTooltip title="Save" placement="top">
            <FButton id="save-button" variant="light" type="button" onClick={handleSave}>
                <FIcon icon="floppy" />
            </FButton>
        </FTooltip>
    );
}
