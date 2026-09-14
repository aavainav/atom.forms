import { FormType, IFormIdentity, IReportViewerData } from "@forms/core";
import { IGAUTCData } from "@forms/ga-utc";
import { IPublicContactOrWarningData } from "@forms/public-contact-or-warning";
import { IDataManager } from "@forms/report-viewer";
import { IS438Data } from "@forms/s438";
import { ITR310Data } from "@forms/tr310";

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
        /**
         * Which of those values the host considers settled rather than an editable suggestion. It is typed against
         * this form's own contract, so a misspelled key here is a compile error rather than a lock that silently
         * does nothing.
         */
        readonly readOnlyFields?: ReadonlyArray<keyof TData & string>;
    };
}

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
        records: mockGAUTCRecords
    }),
    defineForm<IPublicContactOrWarningData>({
        identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" },
        type: "none",
        records: mockPublicContactOrWarningRecords,
        // this agency only ever issues warnings out of Columbia, so a new record's agency name is a settled fact
        // and locked; the city stays editable in case an officer is typing up a record for a different one.
        defaults: {
            data: { agencyCity: "Columbia", agencyName: "Columbia Police Department" },
            readOnlyFields: ["agencyName"]
        }
    }),
    defineForm<ITR310Data>({
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        type: "crash",
        records: mockTR310Records
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
            readOnlyFields: ["courtName"]
        }
    })
];

/**
 * Builds the data manager for one form, demonstrating what a host hands the report viewer: a `read` that turns
 * whatever the host holds into the contract the target form publishes, and a `write` that takes back what the form
 * gives. Neither the form packages nor the report viewer know anything about sessionStorage or this fixture table.
 *
 * The write stores to sessionStorage and the read prefers a stored record over the fixture, so the whole round trip
 * can be seen without a server: load, edit, save, reload.
 *
 * Switch scenarios with `?record=full` or `?record=minimal`. Clear a saved record with `?record=full&reset=1`.
 * `?record=new` starts from the values a host would give a record that does not exist yet -- and locks whichever of
 * them it considers settled -- e.g. `/sc/432?record=new&reset=1` or `/sc/s438?record=new&reset=1`.
 *
 * A form this host holds no fixtures for gets **no manager at all**, which is what a blank, unsaveable form looks
 * like from the report viewer's side.
 */
export function createExampleDataManager(identity: IFormIdentity, searchParams: URLSearchParams): IDataManager | undefined {
    const form = forms.find(entry => entry.identity.name === identity.name && entry.identity.version === identity.version);

    if (!form) {
        return undefined;
    }

    return {
        read: async () => {
            if (searchParams.has("reset")) {
                sessionStorage.removeItem(getStorageKey(form.identity));
            }

            const saved = getSavedData(form.identity);
            if (saved) {
                return { data: saved };
            }

            const scenario = searchParams.get("record") ?? searchParams.get("citation") ?? "full";

            if (scenario === "new") {
                // there is no separate notion of defaults any more: a record that does not exist yet is just a
                // record whose values the host chooses, read the same way as any other
                return form.defaults && { data: stamp(form, form.defaults.data), readOnlyFields: form.defaults.readOnlyFields };
            }

            return { data: stamp(form, form.records[scenario] ?? form.records.full) };
        },
        write: async data => sessionStorage.setItem(getStorageKey(form.identity), JSON.stringify(data))
    };
}

/** Returns the record last saved for the given form, or undefined when nothing has been saved for it. */
function getSavedData(identity: IFormIdentity): IReportViewerData | undefined {
    const saved = sessionStorage.getItem(getStorageKey(identity));
    return saved ? JSON.parse(saved) as IReportViewerData : undefined;
}

/** Keyed by identity so a record saved for one form is never read back into another. */
function getStorageKey({ name, version }: IFormIdentity): string {
    return `example-data:${name}@${version}`;
}

/** A fixture is the target form's own contract, which carries no identity of its own, so the host stamps the one it is loading -- the same identity a save is stamped with. */
function stamp(form: IExampleForm<any>, data: object): IReportViewerData {
    return { ...data, ...form.identity, status: "draft", type: form.type };
}
