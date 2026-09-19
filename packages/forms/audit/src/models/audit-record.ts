import type { PrintLayout } from "@forms/core";

/** Identifies the form a record is about. */
export interface IAuditFormIdentity {
    /** The form instance's id, stable while it is worked on. */
    readonly id: string;
    /** The name the form is registered under. */
    readonly name: string;
    /** The form's version. */
    readonly version: string;
}

/** What happened. Records name the fields touched, never what they held. */
export type AuditRecordDetail =
    /** The form was shown, freshly loaded or swapped in. */
    | { readonly kind: "form-opened" }
    /** Edits settled. `fields` are data-contract paths, such as `violatorSex` or `additionalViolations[1].violationDescription`. */
    | { readonly kind: "fields-edited"; readonly fields: ReadonlyArray<string> }
    /** The form was validated. `fields` are the names of the failing fields, without repeats. */
    | { readonly kind: "validated"; readonly issueCount: number; readonly fields: ReadonlyArray<string> }
    /** The form went into its print layout. `pageNames` is undefined when every page prints. */
    | { readonly kind: "print-started"; readonly layout: PrintLayout; readonly pageNames?: ReadonlyArray<string> }
    /** The form left its print layout. */
    | { readonly kind: "print-ended" }
    /** The form was saved. */
    | { readonly kind: "saved" }
    /** Saving the form failed. */
    | { readonly kind: "save-failed" };

/** What every record carries. */
export interface IAuditRecordBase {
    /** When it happened, in milliseconds since the epoch. */
    readonly at: number;
    /** The form it happened to. */
    readonly form: IAuditFormIdentity;
}

/** Something that happened to a form, as a host receives it. */
export type AuditRecord = IAuditRecordBase & AuditRecordDetail;
