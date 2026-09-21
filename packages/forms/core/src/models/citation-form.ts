import { IForm, FormModel, FormType } from "./form";
import { defineWorkflow, IWorkflow } from "./workflow";

/** Defines the citation form. */
export interface ICitationForm extends IForm {
    /** Returns a form with the date of violation set. */
    setDateOfViolation(): this;
    /** Returns a form with the date the citation was issued set. */
    setIssuedDate(): this;
    /** Returns a form with the time the citation was issued set. */
    setIssuedTime(): this;
    /** Returns a form with the ticket number for the citation set. */
    setTicketNumber(): this;
    /** Returns a form with the time of violation set. */
    setTimeOfViolation(): this;
}

/**
 * The rules a citation moves by: it is issued once, which stamps the date and time it was issued and closes the whole
 * of it. A jurisdiction that leaves some of it open to the officer once it is issued changes that lock.
 */
export const citationWorkflow: IWorkflow = defineWorkflow({
    id: "citation",
    locks: { issued: form => form.setMode("viewable") },
    transitions: {
        issue: {
            effect: form => (form as CitationForm<any>).setIssuedDate().setIssuedTime(),
            from: ["draft", "inProgress"],
            mode: "editable",
            title: "Issue",
            to: "issued"
        }
    },
    version: "1"
});

/**
 * Represents an abstract base class for a citation form.
 *
 * The setters answer with a form rather than changing the one they are called on, because a form model is
 * immutable and every edit replaces it; a setter returning nothing here would have its work discarded.
 */
export abstract class CitationForm<TData extends object> extends FormModel<TData> implements ICitationForm {
    readonly type: FormType = "citation";
    readonly workflow: IWorkflow = citationWorkflow;

    public async initialize(): Promise<this> {
        const form = await super.initialize();

        return form
            .setDateOfViolation()
            .setTicketNumber();
    }

    abstract setDateOfViolation(): this;
    abstract setIssuedDate(): this;
    abstract setIssuedTime(): this;
    abstract setTicketNumber(): this;
    abstract setTimeOfViolation(): this;
}
