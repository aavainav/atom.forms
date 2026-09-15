import { IForm, FormModel, FormType } from "./form";

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
 * Represents an abstract base class for a citation form.
 *
 * The setters answer with a form rather than changing the one they are called on, because a form model is
 * immutable and every edit replaces it; a setter returning nothing here would have its work discarded.
 */
export abstract class CitationForm<TData extends object> extends FormModel<TData> implements ICitationForm {
    readonly type: FormType = "citation";

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
