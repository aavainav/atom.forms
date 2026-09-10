import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { FAsyncLoader } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewer } from "@forms/report-viewer";

import { CATALOG_IDENTITY } from "../models/traffic-form";

/** Defines the Oklahoma City traffic citation form loader. */
export default function OKTrafficFormLoader(): React.JSX.Element {
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
