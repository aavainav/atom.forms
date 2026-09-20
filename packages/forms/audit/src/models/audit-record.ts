import type { FormStatus, PrintLayout } from "@forms/core";

/** Identifies the form a record is about. */
export interface IAuditFormIdentity {
    /** The form instance's id, stable while it is worked on. */
    readonly id: string;
    /** The name the form is registered under. */
    readonly name: string;
    /** The form's version. */
    readonly version: string;
}

/** Every kind of record and what it carries beyond `at` and `form`. Records name the fields touched, never what they held. */
export interface IAuditRecordMap {
    /** Edits settled. `fields` are data-contract paths, such as `violatorSex` or `additionalViolations[1].violationDescription`. */
    "fields-edited": { readonly fields: ReadonlyArray<string> };
    /** The form was shown, freshly loaded or swapped in. The recorder adds `isReadOnly`, which only the host knows. */
    "form-opened": { readonly status: FormStatus; readonly isReadOnly?: boolean };
    /** The form left its print layout. */
    "print-ended": Record<never, never>;
    /** The form went into its print layout. `pageNames` is undefined when every page prints. */
    "print-started": { readonly layout: PrintLayout; readonly pageNames?: ReadonlyArray<string> };
    /** Saving the form failed. */
    "save-failed": Record<never, never>;
    /** The form was saved. */
    "saved": Record<never, never>;
    /** The form's status changed while it was open. */
    "status-changed": { readonly from: FormStatus; readonly to: FormStatus };
    /** The form was validated. `fields` are the names of the failing fields, without repeats. */
    "validated": { readonly issueCount: number; readonly fields: ReadonlyArray<string> };
}

/** The kinds of record there are. */
export type AuditRecordDetailKind = keyof IAuditRecordMap;

/** What happened: a kind, and what that kind carries. */
export type AuditRecordDetail = { [K in AuditRecordDetailKind]: { readonly kind: K } & IAuditRecordMap[K] }[AuditRecordDetailKind];

/** What every record carries. */
export interface IAuditRecordBase {
    /** When it happened, in milliseconds since the epoch. */
    readonly at: number;
    /** The form it happened to. */
    readonly form: IAuditFormIdentity;
}

/** Something that happened to a form, as a host receives it. */
export type AuditRecord = IAuditRecordBase & AuditRecordDetail;
