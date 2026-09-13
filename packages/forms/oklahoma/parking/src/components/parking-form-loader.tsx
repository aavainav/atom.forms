import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService, useServices } from "@common/react";
import { IFormCatalogService, IFormDataHooks, withDataHooks } from "@forms/catalog";
import { FAsyncLoader } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewer } from "@forms/report-viewer";

import { CATALOG_IDENTITY } from "../models/parking-form";

/** Defines the Oklahoma City parking violation form loader. */
export default function OKParkingFormLoader(): React.JSX.Element {
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
                <ReportViewer initialForm={initialForm} />
            )}
        </FAsyncLoader>
    );
}
