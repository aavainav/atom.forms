import React, { Suspense } from "react";
import { useService } from "@common/react";
import { IFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

import { IDataManager, IModalService, IReportViewerService } from "../services";

interface IFormViewerOptionsProps {
    /** The catalog item the form was loaded from; it decides which options are offered. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the options act on. */
    readonly controllers: IControllerManager;
    /** Where the form's data goes when it is saved; the save option is offered only with one. */
    readonly dataManager?: IDataManager<any>;
    /** Reports an option's failure through the report viewer's notifications. */
    readonly onError: (message: string) => void;
}

/**
 * Defines a collection of functionality options rendered at the bottom of the report viewer.
 *
 * The bar renders whatever `getOptions` answers with and nothing else -- the list is already filtered to what this
 * form offers and already in order, so there is no rule here that treats one option differently from another. Each
 * option is loaded lazily, hence the suspense boundary; the fallback is nothing rather than a spinner, because an
 * option appearing a beat late reads better than a row of placeholders.
 *
 * `showModal` and `onError` are handed down rather than reached for, because two of the options are rendered from
 * packages that sit below the report viewer and so cannot resolve its services. The modal in particular has to be
 * opened at the viewer's root: this bar is `position-fixed` and therefore a stacking context, and a modal opened
 * inside one is painted under the backdrop appended to the body.
 */
export const ReportViewerOptions = ({ catalogItem, controllers, dataManager, onError }: IFormViewerOptionsProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const options = reportViewerService.getOptions(catalogItem, dataManager);

    return (
        <div id="report-viewer-options" className="d-flex position-fixed bottom-0 end-0 m-4">
            {options.map(({ id, title, Component }, index) => (
                <div key={id} className={index === 0 ? "" : "ms-2"}>
                    <Suspense fallback={null}>
                        <Component
                            catalogItem={catalogItem}
                            controllers={controllers}
                            dataManager={dataManager}
                            title={title}
                            showModal={options => modalService.showModal(options)}
                            onError={onError}
                        />
                    </Suspense>
                </div>
            ))}
        </div>
    );
}
