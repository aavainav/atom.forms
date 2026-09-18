import React, { Suspense } from "react";
import { useService } from "@common/react";
import { IResolvedFormCatalogItem } from "@forms/catalog";
import { IControllerManager } from "@forms/core";

import { IModalService, IReportViewerDataManager, IReportViewerService } from "../services";

interface IFormViewerOptionsProps {
    /** The catalog item the form was loaded from; printing/violations options resolve against it. */
    readonly catalogItem: IResolvedFormCatalogItem;
    /** The controllers belonging to the form the options act on. */
    readonly controllers: IControllerManager;
    /** Where the form's data goes when it is saved; the save option is offered only with one. */
    readonly dataManager?: IReportViewerDataManager<any>;
    /** Reports an option's failure through the report viewer's notifications. */
    readonly onError: (message: string) => void;
}

/**
 * The functionality options rendered at the bottom of the report viewer.
 *
 * The bar renders whatever `getOptions` returns, already filtered and ordered, with no special-casing here. Each
 * option loads lazily behind a suspense boundary with no fallback -- a late-appearing option reads better than a
 * row of placeholders.
 *
 * `showModal`/`onError` are handed down rather than reached for, since some options render from packages below the
 * report viewer that can't resolve its services. The modal specifically must open at the viewer's root: this bar
 * is `position-fixed`, a stacking context that would paint a modal under the body's own backdrop.
 */
export const ReportViewerOptions = ({ catalogItem, controllers, dataManager, onError }: IFormViewerOptionsProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    // canShow gates on the form's own mapper/violation list, decided per-instance rather than off the catalog item
    const form = controllers.getFormController().form;
    const options = reportViewerService.getOptions(form, dataManager);

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
