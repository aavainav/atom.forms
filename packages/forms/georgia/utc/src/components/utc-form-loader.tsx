import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService, useServices } from "@common/react";
import { IFormCatalogService, IFormDataHooks, withDataHooks } from "@forms/catalog";
import { IControllerManager, FAsyncLoader } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewer } from "@forms/report-viewer";

import { CATALOG_IDENTITY } from "../models/utc-form";

interface IGAUTCFormLoaderProps {
    /** The controllers to use for the loaded form; when omitted the report viewer creates and owns its own. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
}

/** Defines the Georgia uniform traffic citation loader. */
export default function GAUTCFormLoader({ controllers }: IGAUTCFormLoaderProps): React.JSX.Element {
    const formCatalogService = useService<IFormCatalogService>(IFormCatalogService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const services = useServices();

    const params = useParams();
    const [searchParams] = useSearchParams();

    return (
        <FAsyncLoader<IInitialForm> op={async () => {
            const catalogItem = withDataHooks(await formCatalogService.get(CATALOG_IDENTITY), services.tryGet(IFormDataHooks));
            return reportViewerService.loadFormReport(catalogItem, { params, searchParams });
        }}>
            {(initialForm) => (
                <ReportViewer controllers={controllers} initialForm={initialForm} />
            )}
        </FAsyncLoader>
    );
}
