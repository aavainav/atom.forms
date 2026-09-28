import React, { Suspense } from "react";
import { useService } from "@common/react";
import { IResolvedFormCatalogItem } from "@forms/catalog";
import { IActor, IControllerManager } from "@forms/core";

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
    /** Who is using the report, for the options that change it in their name. */
    readonly user?: IActor;
}

/** The functionality options rendered at the bottom left of the report viewer, stacked vertically rather than in a row. */
export const ReportViewerOptions = ({ catalogItem, controllers, dataManager, onError, user }: IFormViewerOptionsProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    // canShow gates on the form's own mapper/violation list, decided per-instance rather than off the catalog item
    const form = controllers.getFormController().form;
    const options = reportViewerService.getOptions(form, dataManager);

    return (
        <div id="report-viewer-options" className="d-flex flex-column position-fixed bottom-0 start-0 m-4">
            {options.map(({ id, title, Component }, index) => (
                <div key={id} className={index === 0 ? "" : "mt-2"}>
                    <Suspense fallback={null}>
                        <Component
                            catalogItem={catalogItem}
                            controllers={controllers}
                            dataManager={dataManager}
                            title={title}
                            showModal={options => modalService.showModal(options)}
                            onError={onError}
                            user={user}
                        />
                    </Suspense>
                </div>
            ))}
        </div>
    );
}
