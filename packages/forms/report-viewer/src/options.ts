import { IReportViewerData } from "@forms/core";
import { createOptions } from "@shrub/core";

export type { IReportViewerData } from "@forms/core";

export const IReportViewerOptions = createOptions<IReportViewerOptions>("report-viewer-module-options", {
});

/** Defines the options for the report viewer. */
export interface IReportViewerOptions {
    /** Optional report data to load and render at startup, resolved against the form catalog by name and version. */
    readonly data?: IReportViewerData;
    /** When true, forms are rendered read-only by default unless a panel explicitly overrides it. */
    readonly isReadOnly?: boolean;
}
