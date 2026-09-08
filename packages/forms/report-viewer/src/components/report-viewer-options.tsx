import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

import { DayNightModeOption, SaveOption, ValidateOption } from "./options";
import { IReportViewerService } from "../services";

interface IFormViewerOptionsProps {
    /** The catalog item the form was loaded from; save is only offered when a mapper is registered to extract its data. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the options act on. */
    readonly controllers: IControllerManager;
}

/** One option to render in the bar, whether built in or registered by another package. */
interface IOptionEntry {
    readonly id: string;
    readonly order: number;
    readonly node: React.ReactNode;
}

/** Defines a collection of functionality options rendered at the bottom of the report viewer. */
export const ReportViewerOptions = ({ catalogItem, controllers }: IFormViewerOptionsProps): React.JSX.Element => {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    // the built-ins and the registered options go into one list ordered the same way, so a package adding an option
    // can place it between them rather than only after them
    const options: Array<IOptionEntry> = [
        { id: "validate", order: 100, node: <ValidateOption controllers={controllers} /> },
        ...reportViewerService.canSaveForm(catalogItem)
            ? [{ id: "save", order: 200, node: <SaveOption catalogItem={catalogItem} controllers={controllers} /> }]
            : [],
        { id: "day-night-mode", order: 900, node: <DayNightModeOption /> },
        ...reportViewerService.getOptions(catalogItem).map(({ id, order, Component }) => ({
            id,
            order,
            node: <Component catalogItem={catalogItem} controllers={controllers} />
        }))
    ];

    options.sort((a, b) => a.order - b.order);

    return (
        <div id="report-viewer-options" className="d-flex position-fixed bottom-0 end-0 m-4">
            {options.map((option, index) => (
                <div key={option.id} className={index === 0 ? "" : "ms-2"}>
                    {option.node}
                </div>
            ))}
        </div>
    );
}
