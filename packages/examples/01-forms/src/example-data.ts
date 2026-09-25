import { SetURLSearchParams } from "react-router";
import { IFormIdentity, IReportData, FormType, ReadOnlyFields } from "@forms/core";
import { IGAUTCData } from "@forms/ga-utc";
import { IPublicContactOrWarningData } from "@forms/public-contact-or-warning";
import { AuditRecord, IReportViewerDataManager, IReviewComment } from "@forms/report-viewer";
import { IS438Data } from "@forms/s438";
import { ITR310Data } from "@forms/tr310";

import { getCitationReport, getCrashReport, getDraftCitationReport, getWarningReport, IHeldReport } from "./example-held-reports";
import { mockCitations } from "./mock-citation-data";
import { mockGAUTCRecords } from "./mock-ga-utc-data";
import { mockPublicContactOrWarningRecords } from "./mock-public-contact-or-warning-data";
import { mockTR310Records } from "./mock-tr310-data";

/** The fixtures for one form, in that form's own published data contract. */
interface IExampleForm<TData extends object> {
    /** The form the fixtures belong to. A record is stamped with this, since a contract carries no identity of its own. */
    readonly identity: Required<IFormIdentity>;
    /** The form type a record loaded for this form is stamped with. */
    readonly type: FormType;
    /** The fixtures, keyed by the scenario the `?record=` query param names. */
    readonly records: Record<string, TData>;
    /** The values a record that does not exist yet starts with. */
    readonly defaults?: {
        readonly data: Partial<TData>;
        /** Which of those values the host considers settled rather than an editable suggestion. Typed against the form's own contract, so a misspelled key here is a compile error, not a silent no-op lock. */
        readonly readOnlyFields?: ReadOnlyFields<TData>;
    };
    /** Tells the report this form holds for `?record=held`, as of the given time: its own id, where it stands, and the history and comments the people who worked on it left. */
    readonly held?: (now: number) => IHeldReport;
}

/** What the host keeps beside a record, apart from the record itself. */
type Kept = "audit" | "comments";

/** Declares one form's fixtures, pinning the contract its records and defaults are typed against. */
function defineForm<TData extends object>(form: IExampleForm<TData>): IExampleForm<any> {
    return form;
}

/**
 * The fixtures each form is served from. A form with no entry here simply gets no data manager, so `ok/parking` and
 * `ok/traffic` render empty rather than quietly borrowing another form's fixture.
 */
const forms: ReadonlyArray<IExampleForm<any>> = [
    defineForm<IGAUTCData>({
        identity: { name: "GA Uniform Traffic Citation", version: "1.0" },
        type: "citation",
        records: mockGAUTCRecords,
        held: getDraftCitationReport
    }),
    defineForm<IPublicContactOrWarningData>({
        identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" },
        type: "none",
        records: mockPublicContactOrWarningRecords,
        // this agency only ever issues warnings out of Columbia, so a new record's agency name is a settled fact
        // and locked; the city stays editable in case an officer is typing up a record for a different one.
        defaults: {
            data: { agencyCity: "Columbia", agencyName: "Columbia Police Department" },
            readOnlyFields: { agencyName: true }
        },
        held: getWarningReport
    }),
    defineForm<ITR310Data>({
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        type: "crash",
        records: mockTR310Records,
        held: getCrashReport
    }),
    defineForm<IS438Data>({
        identity: { name: "S438 Citation Form", version: "1.0" },
        type: "citation",
        records: mockCitations,
        // a second form locking a field, on a different section, to show that locking follows whichever keys a
        // host names rather than being wired up per form: this agency's citations are always returnable to the
        // one municipal court, so its name is stamped and locked while the trial date and time stay editable.
        defaults: {
            data: { courtName: "Columbia Municipal Court", courtCity: "Columbia", courtState: "SC" },
            readOnlyFields: { courtName: true }
        },
        held: getCitationReport
    })
];

/**
 * Builds the data manager for one form, demonstrating what a host hands the report viewer: a `read` that turns
 * whatever the host holds into the target form's contract, and a `write` that takes back what the form gives.
 * Neither the form packages nor the report viewer know anything about sessionStorage or this fixture table.
 *
 * `write` stores to sessionStorage and `read` prefers a stored record over the fixture, so the whole round trip
 * shows without a server: load, edit, save, reload. With no `?record=` and nothing saved, `read` returns nothing
 * and the form opens blank.
 *
 * Switch scenarios with `?record=full`/`?record=minimal`; clear a saved record with `&reset=1`. `?record=new`
 * starts from a not-yet-existing record's defaults, locking whichever fields are settled -- e.g.
 * `/sc/432?record=new&reset=1`. The report viewer's own "New Form" option reaches this the same way via
 * `reason: "new"`, and `read` stamps `?record=new` onto the url then, so a refresh doesn't silently read back
 * whatever was last saved.
 *
 * `?record=held` is a report the host has been keeping: the full fixture with an id, a status, the history its
 * workflow has made, and the audit history and comments the people who worked on it left, all handed over in the one
 * `read`. "Load test data" (`forms/load-test-data-option.tsx`) is the interactive equivalent.
 *
 * With `keepsHistory` the manager also has a `writeAudit` and a `writeComments`, so that a host that keeps them is
 * shown: they are stored beside the record and come back with it. Without it the audit history and the comments last
 * only as long as the form is on screen, which is all a demo that has no use for them needs.
 *
 * A form this host holds no fixtures for gets **no manager at all** -- a blank, unsaveable form.
 */
export function createExampleDataManager(identity: IFormIdentity, searchParams: URLSearchParams, setSearchParams: SetURLSearchParams, keepsHistory = false): IReportViewerDataManager | undefined {
    const form = forms.find(entry => entry.identity.name === identity.name && entry.identity.version === identity.version);

    if (!form) {
        return undefined;
    }

    return {
        read: async reason => {
            if (searchParams.has("reset")) {
                clearExampleData(form.identity);
            }

            const scenario = searchParams.get("record") ?? searchParams.get("citation");

            if (reason === "new" || scenario === "new") {
                if (reason === "new" && scenario !== "new") {
                    // stamp the url with the state actually on screen, so a refresh sees the same new/blank form
                    // instead of silently reading back whatever was last saved or the "full" fixture
                    setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        next.set("record", "new");
                        return next;
                    }, { replace: true });
                }

                // a new report has no history, and what was kept belonged to the one it replaces
                if (keepsHistory) {
                    setKept(form.identity, "audit", []);
                    setKept(form.identity, "comments", []);
                }

                // a new record starts from the host's own defaults, ignoring whatever is saved for the record
                // being replaced -- a stale record surviving into a "new" one is exactly what `reason` prevents
                return form.defaults && { data: stamp(form, form.defaults.data), readOnlyFields: form.defaults.readOnlyFields };
            }

            const saved = getSavedData(form.identity);
            if (saved) {
                // the status and the workflow history are kept beside the record, so they come back with it, and so do
                // the audit history and the comments when the host keeps them
                return {
                    ...(keepsHistory ? { audit: getKept<AuditRecord>(form.identity, "audit"), comments: getKept<IReviewComment>(form.identity, "comments") } : {}),
                    data: saved,
                    status: saved.status,
                    workflow: saved.workflow
                };
            }

            if (!scenario) {
                return undefined;
            }

            const held = scenario === "held" ? form.held?.(Date.now()) : undefined;

            if (held) {
                // what the host keeps starts as what the report's people left, and grows as it is worked on
                if (keepsHistory) {
                    setKept(form.identity, "audit", held.audit);
                    setKept(form.identity, "comments", held.comments);
                }

                return {
                    audit: held.audit,
                    comments: held.comments,
                    data: { ...stamp(form, form.records.full), id: held.id, revision: held.revision, status: held.status },
                    status: held.status,
                    workflow: held.workflow
                };
            }

            return { data: stamp(form, form.records[scenario] ?? form.records.full) };
        },
        write: async data => sessionStorage.setItem(getStorageKey(form.identity), JSON.stringify(data)),
        ...(keepsHistory ? {
            // append-only: the records are new to the host, matched by id, so a record handed over twice is kept once
            writeAudit: async (records: ReadonlyArray<AuditRecord>): Promise<void> => {
                const kept = getKept<AuditRecord>(form.identity, "audit");
                const known = new Set(kept.map(record => record.id));

                setKept(form.identity, "audit", [...kept, ...records.filter(record => !known.has(record.id))]);
            },
            // all of them each time, since a comment can be resolved as well as added
            writeComments: async (comments: ReadonlyArray<IReviewComment>): Promise<void> => setKept(form.identity, "comments", comments)
        } : {})
    };
}

/** Forgets the record saved for the given form, and the audit history and comments kept beside it, so that it is read from its fixture again. */
export function clearExampleData(identity: IFormIdentity): void {
    sessionStorage.removeItem(getStorageKey(identity));
    sessionStorage.removeItem(getStorageKey(identity, "audit"));
    sessionStorage.removeItem(getStorageKey(identity, "comments"));
}

/** Whether this host holds a report to load for the given form, which is how the "Load test data" option knows whether to offer itself. */
export function hasExampleHeldReport(identity: IFormIdentity): boolean {
    return !!forms.find(entry => entry.identity.name === identity.name && entry.identity.version === identity.version)?.held;
}

/** Returns what was kept beside the record for the given form, or nothing when nothing has been. */
function getKept<T>(identity: IFormIdentity, kept: Kept): ReadonlyArray<T> {
    const stored = sessionStorage.getItem(getStorageKey(identity, kept));
    return stored ? JSON.parse(stored) as ReadonlyArray<T> : [];
}

/** Returns the record last saved for the given form, or undefined when nothing has been saved for it. */
function getSavedData(identity: IFormIdentity): IReportData | undefined {
    const saved = sessionStorage.getItem(getStorageKey(identity));
    return saved ? JSON.parse(saved) as IReportData : undefined;
}

/** Keyed by identity so a record saved for one form is never read back into another. What is kept beside it has a key of its own. */
function getStorageKey({ name, version }: IFormIdentity, kept?: Kept): string {
    return `example-data:${name}@${version}${kept ? `:${kept}` : ""}`;
}

/** Keeps what the host holds beside the record for the given form, replacing what was kept. */
function setKept(identity: IFormIdentity, kept: Kept, values: ReadonlyArray<unknown>): void {
    sessionStorage.setItem(getStorageKey(identity, kept), JSON.stringify(values));
}

/** A fixture is the target form's own contract, which carries no identity of its own, so the host stamps the one it is loading -- the same identity a save is stamped with. */
function stamp(form: IExampleForm<any>, data: object): IReportData {
    return { ...data, ...form.identity, status: "draft", type: form.type };
}
