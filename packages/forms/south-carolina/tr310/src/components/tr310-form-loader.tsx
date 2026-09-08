import React from "react";
import { useParams, useSearchParams } from "react-router";
import { useService } from "@common/react";
import { IControllerManager, FAsyncLoader } from "@forms/core";
import { IInitialForm, IReportViewerService, ReportViewer } from "@forms/report-viewer";

const CATALOG_IDENTITY = { name: "SC TR-310 - Traffic Collision Report", version: "1.0" };

interface ITR310FormLoaderProps {
    /** The controllers to use for the loaded form; when omitted the report viewer creates and owns its own. Supply this when something rendered outside the form, such as a panel of draggable items, needs the same controllers. */
    readonly controllers?: IControllerManager;
}

/** Defines the TR-310 traffic collision report loader. */
export default function TR310FormLoader({ controllers }: ITR310FormLoaderProps): React.JSX.Element {
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const params = useParams();
    const [searchParams] = useSearchParams();

    return (
        <FAsyncLoader<IInitialForm | undefined> op={() => reportViewerService.loadFormReport({ params, searchParams }, CATALOG_IDENTITY)}>
            {(initialForm) => (
                <ReportViewer controllers={controllers} initialForm={initialForm} />
            )}
        </FAsyncLoader>
    );
}
