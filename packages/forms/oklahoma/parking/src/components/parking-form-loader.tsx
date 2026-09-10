import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { FAsyncLoader } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewer } from "@forms/report-viewer";

import { CATALOG_IDENTITY } from "../models/parking-form";

/** Defines the Oklahoma City parking violation form loader. */
export default function OKParkingFormLoader(): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const params = useParams();
    const [searchParams] = useSearchParams();

    return (
        <FAsyncLoader<IInitialForm | undefined> op={() => reportViewerService.loadFormReport({ params, searchParams }, CATALOG_IDENTITY)}>
            {(initialForm) => (
                <ReportViewer initialForm={initialForm} />
            )}
        </FAsyncLoader>
    );
}
