import { IReportViewerData } from "@forms/core";
import { createOptions } from "@shrub/core";

export type { IReportViewerData } from "@forms/core";

export const IReportViewerOptions = createOptions<IReportViewerOptions>("report-viewer-module-options", {
});

/** Default values for a newly created record, together with which of its own fields should come back locked rather than editable. */
export interface IFormDefaults {
    /**
     * The values a new record should start with. Fields it doesn't mention stay at their type's zero-value, the
     * same way a record loaded through `getData` leaves an unmentioned field unchanged.
     */
    readonly data: IReportViewerData;
    /**
     * Which of `data`'s own fields should come back disabled rather than editable, named by the same keys the
     * form's mapper publishes on its data contract. A field the mapper hasn't wired up for locking (see
     * `FormMapper.write`) stays editable regardless of being listed here. Omit to leave every defaulted field
     * editable.
     */
    readonly readOnlyFields?: ReadonlySet<string>;
}

/** Defines the options for the report viewer. */
export interface IReportViewerOptions {
    /** Optional report data to load and render at startup, resolved against the form catalog by name and version. */
    readonly data?: IReportViewerData;
    /**
     * Optional static defaults for a newly created record, used only once there is nothing to load. See
     * `IFormDataReader.getDefaultData` for the per-reader equivalent, which takes precedence when a reader
     * implements it.
     */
    readonly defaultData?: IFormDefaults;
    /** When true, forms are rendered read-only by default unless a panel explicitly overrides it. */
    readonly isReadOnly?: boolean;
}
