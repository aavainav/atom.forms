import { IForm } from "../../models/form";
import type { IWorkflowStamp } from "../../models/workflow";

/** Defines the minimum shape of report data needed to resolve and render a form via the form catalog; additional form-specific fields are expected but are not modeled here. */
export interface IReportData extends IForm {
    readonly [key: string]: unknown;
    /** The history of the report in its workflow. A form without a workflow leaves it out. */
    readonly workflow?: IWorkflowStamp;
}
