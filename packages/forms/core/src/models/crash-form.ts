import { IForm, FormModel, FormType } from "./form";
import { defineWorkflow, IWorkflow } from "./workflow";
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
 * The rules a crash report moves by: the officer submits it for review, and the reviewer approves it or sends it back
 * with comments to be fixed. Once submitted, and once approved, it is closed. A report cannot be approved, or
 * resubmitted after it is sent back, while any comment is still open -- they must be resolved first.
 */
export const crashWorkflow: IWorkflow = defineWorkflow({
    id: "crash",
    locks: {
        approved: form => form.setMode("viewable"),
        inReview: form => form.setMode("viewable")
    },
    transitions: {
        approve: { from: ["inReview"], guards: ["noOpenComments"], icon: "check2-circle", mode: "reviewable", title: "Approve", to: "approved" },
        reject: { from: ["inReview"], guards: ["hasOpenComments"], icon: "x-circle", mode: "reviewable", title: "Reject", to: "rejected" },
        submit: { from: ["draft", "inProgress", "rejected"], guards: ["noOpenComments"], icon: "send", mode: "editable", title: "Submit for review", to: "inReview" }
    },
    version: "1"
});

/**
 * Represents an abstract base class for a crash form.
 *
 * The setters answer with a form rather than changing the one they are called on, because a form model is
 * immutable and every edit replaces it; a setter returning nothing here would have its work discarded.
 */
export abstract class CrashForm<TData extends object> extends FormModel<TData> implements ICrashForm {
    readonly type: FormType = "crash";

    abstract getCrashData(): ICrash;
    abstract setCrashNumber(): this;
    abstract setDateOfCrash(): this;
    abstract setTimeOfCrash(): this;
}
