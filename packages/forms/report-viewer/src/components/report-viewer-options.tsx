import React from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

import { IReportViewerService } from "../services";

interface IFormViewerOptionsProps {
    /** The catalog item the form was loaded from; it decides which options are offered. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the options act on. */
    readonly controllers: IControllerManager;
}

/**
 * Defines a collection of functionality options rendered at the bottom of the report viewer.
 *
 * The bar renders whatever the service answers with and nothing else — the report viewer's own validate, save and
 * day/night are registered in its module alongside print and violations, so there is no built-in here to place
 * against a registered one, and an option added by a package can sit anywhere in the order rather than only after
 * them. `getOptions` has already dropped the options this form does not offer and put the rest in order.
 */
export const ReportViewerOptions = ({ catalogItem, controllers }: IFormViewerOptionsProps): React.JSX.Element => {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const options = reportViewerService.getOptions(catalogItem);

    return (
        <div id="report-viewer-options" className="d-flex position-fixed bottom-0 end-0 m-4">
            {options.map(({ id, title, Component }, index) => (
                <div key={id} className={index === 0 ? "" : "ms-2"}>
                    <Component catalogItem={catalogItem} controllers={controllers} title={title} />
                </div>
            ))}
        </div>
    );
}
