import { createOptions } from "@shrub/core";

export const IReportViewerOptions = createOptions<IReportViewerOptions>("report-viewer-module-options", {
});

/** Defines the options for the report viewer. */
export interface IReportViewerOptions {
    /** When true, forms are rendered read-only by default unless a panel explicitly overrides it. */
    readonly isReadOnly?: boolean;
}
