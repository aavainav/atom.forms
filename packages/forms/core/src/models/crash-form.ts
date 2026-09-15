import { IForm, FormModel, FormType } from "./form";
import { ICrash } from "../mapping/data/crash";

/** Defines the crash form. */
export interface ICrashForm extends IForm {
    /** Gets the mapped crash data. */
    getCrashData(): ICrash;

    /** Returns a form with the crash number set. */
    setCrashNumber(): this;
    /** Returns a form with the date of the crash set. */
    setDateOfCrash(): this;
    /** Returns a form with the time of the crash set. */
    setTimeOfCrash(): this;
}

/**
 * Represents an abstract base class for a crash form.
 *
 * The setters answer with a form rather than changing the one they are called on, because a form model is
 * immutable and every edit replaces it; a setter returning nothing here would have its work discarded.
 */
export abstract class CrashForm extends FormModel<any> implements ICrashForm {
    readonly type: FormType = "crash";

    abstract getCrashData(): ICrash;
    abstract setCrashNumber(): this;
    abstract setDateOfCrash(): this;
    abstract setTimeOfCrash(): this;
}
