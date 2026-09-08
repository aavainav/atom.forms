import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { FAsyncLoader } from "@forms/core";

import { ReportViewer } from "./report-viewer";
import { IInitialForm, IReportViewerService } from "../services";

/**
 * The loaded form, wrapped rather than returned bare because `FAsyncLoader` renders nothing at all for an undefined
 * result: the viewer must still mount for a route the data reader has no report for, since that is what renders the
 * matched child route and the modal manager.
 */
interface IReportViewerLoaderResult {
    readonly initialForm?: IInitialForm;
}

/** Defines the report viewer loader. This is used to load report data, if any, before mounting the report viewer. */
export default function ReportViewerLoader(): React.JSX.Element {
     const params = useParams();
    const [searchParams] = useSearchParams();

    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    return (
        <FAsyncLoader<IReportViewerLoaderResult> op={async () => ({ initialForm: await reportViewerService.loadFormReport({ params, searchParams }) })}>
            {(result) => (
                <ReportViewer initialForm={result.initialForm} />
            )}
        </FAsyncLoader>
    );
}
