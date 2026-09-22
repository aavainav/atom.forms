import { IForm, FormModel, FormType } from "./form";
import { defineWorkflow, IWorkflow } from "./workflow";

/** Defines the warning form. */
export interface IWarningForm extends IForm {
    /** Returns a form with the date the warning was issued set. */
    setIssuedDate(): this;
    /** Returns a form with the time the warning was issued set. */
    setIssuedTime(): this;
    /** Returns a form with the ticket number for the warning set. */
    setTicketNumber(): this;
}

/**
 * The rules a warning moves by: it is issued once, which stamps the date and time it was issued and closes the whole
 * of it. A jurisdiction that leaves some of it open to the officer once it is issued changes that lock.
 */
export const warningWorkflow: IWorkflow = defineWorkflow({
    id: "warning",
    locks: { issued: form => form.setMode("viewable") },
    transitions: {
        issue: {
            effect: form => (form as WarningForm<any>).setIssuedDate().setIssuedTime(),
            from: ["draft", "inProgress"],
            icon: "check2-circle",
            mode: "editable",
            title: "Issue",
            to: "issued"
        }
    },
    version: "1"
});

/**
 * Represents an abstract base class for a warning form.
 *
 * The setters answer with a form rather than changing the one they are called on, because a form model is
 * immutable and every edit replaces it; a setter returning nothing here would have its work discarded.
 */
export abstract class WarningForm<TData extends object> extends FormModel<TData> implements IWarningForm {
    readonly type: FormType = "warning";
    readonly workflow: IWorkflow = warningWorkflow;

    public async initialize(): Promise<this> {
        const form = await super.initialize();

        return form.setTicketNumber();
    }

    abstract setIssuedDate(): this;
    abstract setIssuedTime(): this;
    abstract setTicketNumber(): this;
}
