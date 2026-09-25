import { IActor, IControllerActivityMap, IFormActivityMap, FormMode, FormStatus, PrintLayout } from "@forms/core";

/** An activity that came with a change to the form gets the paths the change touched, which only the audit can work out. */
type WithChangedFields<TMap> = { readonly [K in keyof TMap]: TMap[K] & { readonly fields: ReadonlyArray<string> } };

/** Identifies the form a record is about. */
export interface IAuditFormIdentity {
    /** The form instance's id, stable while it is worked on. */
    readonly id: string;
    /** How many times the report had been saved when this happened. */
    readonly revision: number;
    /** The name the form is registered under. */
    readonly name: string;
    /** The form's version. */
    readonly version: string;
}

/** Every kind of record and what it carries beyond `at` and `form`, including the kinds other packages report. Records name the fields touched, never what they held. */
export interface IAuditRecordMap extends IControllerActivityMap, WithChangedFields<IFormActivityMap> {
    /** Edits settled. `fields` are data-contract paths, such as `violatorSex` or `additionalViolations[1].violationDescription`. */
    "fields-edited": { readonly fields: ReadonlyArray<string> };
    /** The form was closed: unmounted, put away with the page, or replaced by another. `isDirty` says whether it still held changes that were never saved. */
    "form-closed": { readonly isDirty: boolean; readonly mode: FormMode; readonly status: FormStatus };
    /** The form was shown, freshly loaded or swapped in. */
    "form-opened": { readonly status: FormStatus; readonly mode: FormMode };
    /** The form left its print layout. */
    "print-ended": Record<never, never>;
    /** The form went into its print layout. `pageNames` is undefined when every page prints. */
    "print-started": { readonly layout: PrintLayout; readonly pageNames?: ReadonlyArray<string> };
    /** Report data was copied to the clipboard. `tab` is the id of the tab copied, such as `data` or `all`. */
    "report-data-copied": { readonly tab: string };
    /** Report data was shown. `tab` is the id of the tab that came into view, such as `data` or `audit`. */
    "report-data-viewed": { readonly tab: string };
    /** Saving the form failed. */
    "save-failed": Record<never, never>;
    /** The form was saved. */
    "saved": Record<never, never>;
    /** The form's status changed while it was open. */
    "status-changed": { readonly from: FormStatus; readonly to: FormStatus };
    /** The form was validated. `fields` are the names of the failing fields, without repeats. */
    "validated": { readonly issueCount: number; readonly fields: ReadonlyArray<string> };
    /** The form made a transition of its workflow. `transition` is the id it is made by, and `note` is what was kept with it. */
    "workflow-transition": { readonly transition: string; readonly from: FormStatus; readonly to: FormStatus; readonly note?: string };
}

/** The kinds of record there are. */
export type AuditRecordDetailKind = keyof IAuditRecordMap;

/** What happened: a kind, and what that kind carries. */
export type AuditRecordDetail = { [K in AuditRecordDetailKind]: { readonly kind: K } & IAuditRecordMap[K] }[AuditRecordDetailKind];

/** What every record carries. */
export interface IAuditRecordBase {
    /** When it happened, in milliseconds since the epoch. */
    readonly at: number;
    /** Who was using the report when it happened. Undefined when the host did not say who that was. */
    readonly by?: IActor;
    /** The form it happened to. */
    readonly form: IAuditFormIdentity;
    /** Identifies the record, so a host handed the same one twice can tell. */
    readonly id: string;
}

/** Something that happened to a form, as a host receives it. */
export type AuditRecord = IAuditRecordBase & AuditRecordDetail;
