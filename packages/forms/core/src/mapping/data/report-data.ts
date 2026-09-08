import { IForm } from "../../models/form";

/** Defines the minimum shape of report data needed to resolve and render a form via the form catalog; additional form-specific fields are expected but are not modeled here. */
export interface IReportViewerData extends IForm {
    readonly [key: string]: unknown;
}
