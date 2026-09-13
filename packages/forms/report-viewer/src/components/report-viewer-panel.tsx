import React from "react";
import { useService } from "@common/react";
import { IFormCatalogService } from "@forms/catalog";
import { FAsyncLoader, IReportViewerData } from "@forms/core";

import { ReportViewerForm } from "./report-viewer-form";
import { IFormReportIdentity, IInitialForm, IReportViewerService } from "../services";

import "@forms/core/theme/_main.scss";

export interface IReportViewerPanelOptions extends IFormReportIdentity {
    /** When true, every field on the form is disabled and its editing affordances (add/delete page, drag-and-drop import) are not offered. */
    readonly isReadOnly?: boolean;
    /** Whether the options bar is rendered beneath the form. */
    readonly showOptions?: boolean;
}

interface IReportViewerPanelProps {
    /** Report data the host has already resolved and mapped into the shape the target catalog form expects. */
    readonly data: IReportViewerData | undefined;
    readonly options?: IReportViewerPanelOptions;
}

/** A data-driven, router-agnostic report viewer for hosts that have already resolved and mapped their own report data and just want to mount the matching catalog form. */
export default function ReportViewerPanel({ data, options }: IReportViewerPanelProps): React.JSX.Element {
    const formCatalogService = useService<IFormCatalogService>(IFormCatalogService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);

    const isReadOnly = options?.isReadOnly ?? reportViewerService.isReadOnly;

    return (
        <FAsyncLoader<IInitialForm | undefined> op={async () => {
            const name = options?.name ?? data?.name;
            if (!name) {
                return undefined;
            }

            const catalogItem = await formCatalogService.get({ name, version: options?.version ?? data?.version });
            return reportViewerService.loadForm(catalogItem, data);
        }}>
            {(initialForm) => initialForm && <ReportViewerForm initialForm={initialForm} isReadOnly={!!isReadOnly} showOptions={options?.showOptions} />}
        </FAsyncLoader>
    );
}