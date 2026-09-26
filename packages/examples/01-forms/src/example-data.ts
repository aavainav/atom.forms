import { SetURLSearchParams } from "react-router";
import { IFormIdentity, IReportData, FormType, ReadOnlyFields } from "@forms/core";
import { IGAUTCData } from "@forms/ga-utc";
import { IPublicContactOrWarningData } from "@forms/public-contact-or-warning";
import { AuditRecord, IReadDataResult, IReportPreset, IReportTemplate, IReportViewerDataManager, IReviewComment } from "@forms/report-viewer";
import { IS438Data } from "@forms/s438";
import { ITR310Data } from "@forms/tr310";

import { getCitationReport, getCrashReport, getDraftCitationReport, getWarningReport, IHeldReport } from "./example-held-reports";
import { mockCitations } from "./mock-citation-data";
import { mockGAUTCRecords } from "./mock-ga-utc-data";
import { mockPublicContactOrWarningRecords } from "./mock-public-contact-or-warning-data";
import { mockTR310Records } from "./mock-tr310-data";

/** A starting point for a new report: the presets it names, laid down in order, and then its own data on top. */
interface IExampleTemplate<TData extends object> extends IReportTemplate {
    readonly data?: Partial<TData>;
    /** The ids of the form's presets to start from, in the order they are laid down. */
    readonly presets?: ReadonlyArray<string>;
    readonly readOnlyFields?: ReadOnlyFields<TData>;
}

/** The fixtures for one form, in that form's own published data contract. */
interface IExampleForm<TData extends object> {
    /** The form the fixtures belong to. A record is stamped with this, since a contract carries no identity of its own. */
    readonly identity: Required<IFormIdentity>;
    /** The form type a record loaded for this form is stamped with. */
    readonly type: FormType;
    /** The fixtures, keyed by the scenario the `?record=` query param names. */
    readonly records: Record<string, TData>;
    /** The pieces the templates are built from, which an officer can also apply to a report already under way. Typed against the form's own contract, so a misspelled key in a preset's `readOnlyFields` is a compile error, not a silent no-op lock. */
    readonly presets?: ReadonlyArray<IReportPreset<TData>>;
    /** What a new report can start from. The one flagged as the default replaces the form's own, so it is where a settled value is locked for every report. */
    readonly templates?: ReadonlyArray<IExampleTemplate<TData>>;
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
        // no default of its own, so a new citation starts as the form makes it; a template needs no presets either
        templates: [
            {
                id: "georgia-driver",
                title: "Georgia driver",
                description: "A Georgia license, address and plates.",
                data: {
                    vehicleRegistrationState: { value: "GA", description: "GEORGIA" },
                    violatorLicenseState: { value: "GA", description: "GEORGIA" },
                    violatorState: { value: "GA", description: "GEORGIA" }
                }
            }
        ],
        held: getDraftCitationReport
    }),
    defineForm<IPublicContactOrWarningData>({
        identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" },
        type: "none",
        records: mockPublicContactOrWarningRecords,
        presets: [
            // this agency only ever issues warnings out of Columbia, so a new record's agency name is a settled fact
            // and locked; the city stays editable in case an officer is typing up a record for a different one.
            {
                id: "columbia-pd",
                title: "Columbia Police Department",
                data: { agencyCity: "Columbia", agencyName: "Columbia Police Department" },
                readOnlyFields: { agencyName: true }
            }
        ],
        templates: [
            { id: "standard", title: "Public contact", description: "The agency's own record, with nothing else chosen.", isDefault: true, presets: ["columbia-pd"] },
            { id: "speeding-stop", title: "Speeding stop", description: "A moving violation, stopped for speeding.", presets: ["columbia-pd"], data: { natureSpeeding: true, primaryReasonMovingViolation: true } },
            { id: "motorist-assistance", title: "Motorist assistance", description: "Contact only, to help a motorist.", presets: ["columbia-pd"], data: { natureContactOnly: true, primaryReasonMotoristAssistance: true } }
        ],
        held: getWarningReport
    }),
    defineForm<ITR310Data>({
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        type: "crash",
        records: mockTR310Records,
        // no default of its own; these two are built wholly from presets, to show a template needing no data beside them
        presets: [
            {
                id: "rear-end",
                title: "Rear-end collision",
                group: "Collisions",
                data: {
                    conditionsMannerOfCollision: { value: "20", description: "FRONT TO REAR" },
                    harmfulEventFirst: { value: "22", description: "MOVING MOTOR VEHICLE" },
                    harmfulEventLocation: { value: "05", description: "ROADWAY" }
                }
            },
            {
                id: "wet-daylight",
                title: "Wet road, rain, daylight",
                group: "Conditions",
                data: {
                    conditionsLight: { value: "01", description: "DAYLIGHT" },
                    conditionsRoadSurface: { value: "02", description: "WET" },
                    conditionsWeatherFirst: { value: "02", description: "RAIN" }
                }
            },
            // sets data on more than one page, each list paired with the report's by position; the pedestrian is a person
            // page and not a unit page, as the fixtures have it. headerUnitCount is left to the officer: whether a
            // non-motorist counts is the agency's rule
            {
                id: "mv-and-pedestrian",
                title: "Motor vehicle and pedestrian",
                group: "Collisions",
                description: "One vehicle, its driver, and a pedestrian.",
                data: {
                    units: [{ unitHeaderUnitNumber: "1", unitTypeUnit: { value: "01", description: "AUTOMOBILE" } }],
                    persons: [
                        { personHeaderPersonNumber: "1", personHeaderUnitNumber: "1", personHeaderPersonType: { value: "1", description: "MV DRIVER" } },
                        { personHeaderPersonNumber: "2", personHeaderUnitNumber: "2", personHeaderPersonType: { value: "3", description: "NON-MOTORIST" }, nonMotoristUnitType: { value: "64", description: "PEDESTRIAN" } }
                    ]
                }
            }
        ],
        templates: [
            { id: "rear-end-collision", title: "Rear-end collision", description: "One vehicle into the back of another, on the roadway.", presets: ["rear-end"] },
            { id: "rear-end-collision-rain", title: "Rear-end collision in the rain", description: "The same, on a wet road in daylight.", presets: ["rear-end", "wet-daylight"] },
            { id: "mv-and-pedestrian-collision", title: "Motor vehicle and pedestrian", description: "A collision between a vehicle and a pedestrian, with a page for each.", presets: ["mv-and-pedestrian"] }
        ],
        held: getCrashReport
    }),
    defineForm<IS438Data>({
        identity: { name: "S438 Citation Form", version: "1.0" },
        type: "citation",
        records: mockCitations,
        presets: [
            // a second form locking a field, on a different section, to show that locking follows whichever keys a
            // host names rather than being wired up per form: this agency's citations are always returnable to the
            // one municipal court, so its name is stamped and locked while the trial date and time stay editable.
            {
                id: "columbia-court",
                title: "Columbia Municipal Court",
                data: { courtName: "Columbia Municipal Court", courtCity: "Columbia", courtState: "SC" },
                readOnlyFields: { courtName: true }
            }
        ],
        templates: [
            { id: "standard", title: "Citation", description: "The agency's own citation, with nothing else chosen.", isDefault: true, presets: ["columbia-court"] },
            {
                id: "speeding-15-over",
                title: "Speeding, 15 over",
                description: "Fifteen miles per hour over the posted limit.",
                presets: ["columbia-court"],
                data: { violationDescription: "Speeding, 15 mph over posted limit", violationScPoints: 4, violationSectionNumber: "56-5-1520" }
            },
            {
                id: "stop-sign",
                title: "Failure to stop at a stop sign",
                presets: ["columbia-court"],
                data: { violationDescription: "Failure to stop at a stop sign", violationSectionNumber: "56-5-2110" }
            }
        ],
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
 * starts a new report from the form's default template, if it has one, locking whichever fields are settled -- e.g.
 * `/sc/432?record=new&reset=1` -- and `?template=` starts one from a named template, which the route page hands
 * the report viewer to start from. The report viewer's own "New Form" option reaches this the same way via
 * `reason: "new"`, and `read` stamps `?record=new`, and the template the user picked, onto the url then, so a
 * refresh doesn't silently read back whatever was last saved.
 *
 * A template is built from the presets it names, laid down in order, and then its own data on top. The report
 * viewer is handed only the finished record: putting one together is the host's business, not its.
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

    const { templates } = form;

    return {
        read: async (reason, template) => {
            if (searchParams.has("reset")) {
                clearExampleData(form.identity);
            }

            const scenario = searchParams.get("record") ?? searchParams.get("citation");

            if (reason === "new" || scenario === "new") {
                if (reason === "new") {
                    // stamp the url with the state actually on screen, so a refresh sees the same new form, from the
                    // same template, instead of silently reading back whatever was last saved or the "full" fixture
                    const stamped = new URLSearchParams(searchParams);
                    stamped.set("record", "new");

                    if (template) {
                        stamped.set("template", template);
                    }
                    else {
                        stamped.delete("template");
                    }

                    if (stamped.toString() !== searchParams.toString()) {
                        setSearchParams(stamped, { replace: true });
                    }
                }

                // a new report has no history, and what was kept belonged to the one it replaces
                if (keepsHistory) {
                    setKept(form.identity, "audit", []);
                    setKept(form.identity, "comments", []);
                }

                // a new record starts from the template it was asked for, or else the host's default one, ignoring
                // whatever is saved for the record being replaced -- a stale record surviving into a "new" one is
                // exactly what `reason` prevents. a form with no default template starts as the form makes it
                const chosen = template ?? templates?.find(entry => entry.isDefault)?.id;

                return chosen ? resolveTemplate(form, chosen) : undefined;
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
        // the presets are the host's own and the officer's, the officer's first; the officer's are kept apart from the record, so a reset does not lose them
        deletePreset: async id => setPersonalPresets(form.identity, getPersonalPresets(form.identity).filter(preset => preset.id !== id)),
        readPresets: async () => [...getPersonalPresets(form.identity), ...(form.presets ?? [])],
        // what the picker lists, without the data each is built from -- that comes with `read`, when one is chosen
        ...(templates ? { readTemplates: async (): Promise<ReadonlyArray<IReportTemplate>> => templates.map(({ description, group, id, isDefault, title }) => ({ description, group, id, isDefault, title })) } : {}),
        writePreset: async preset => setPersonalPresets(form.identity, [...getPersonalPresets(form.identity).filter(kept => kept.id !== preset.id), preset]),
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

/** Forgets the presets the officer saved for the given form. They outlive a reset of the record, so this is the only thing that clears them. */
export function clearExamplePresets(identity: IFormIdentity): void {
    sessionStorage.removeItem(getPresetsKey(identity));
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

/** Returns the presets the officer saved for the given form. They have a key of their own and are never cleared with the record, since they belong to the officer, not to the report. */
function getPersonalPresets(identity: IFormIdentity): ReadonlyArray<IReportPreset<any>> {
    const stored = sessionStorage.getItem(getPresetsKey(identity));
    return stored ? JSON.parse(stored) as ReadonlyArray<IReportPreset<any>> : [];
}

/** The key the officer's presets for the given form are kept under. */
function getPresetsKey({ name, version }: IFormIdentity): string {
    return `example-data:${name}@${version}:presets`;
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

/** Whether the value is an object that holds others by key, as a value in a record is, rather than an array of them or nothing. */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Lays `next` over `base`: objects merge key by key, and anything else -- a value, or a list of pages -- is replaced by the later. */
function merge<T extends Record<string, unknown>>(base: T, next: T): T {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(next)) {
        const current = merged[key];
        merged[key] = isRecord(current) && isRecord(value) ? merge(current, value) : value;
    }

    return merged as T;
}

/** Puts together what a new report starts with from the template: the presets it names, in order, and then its own data on top. */
function resolveTemplate(form: IExampleForm<any>, id: string): IReadDataResult {
    const template = form.templates?.find(entry => entry.id === id);

    if (!template) {
        throw new Error(`"${form.identity.name}" has no template called "${id}".`);
    }

    let data: Record<string, unknown> = {};
    let readOnlyFields: ReadOnlyFields<any> = {};

    for (const presetId of template.presets ?? []) {
        const preset = form.presets?.find(entry => entry.id === presetId);

        if (!preset) {
            throw new Error(`The "${id}" template of "${form.identity.name}" names a preset, "${presetId}", that it has not got.`);
        }

        data = merge(data, preset.data);
        readOnlyFields = merge(readOnlyFields, preset.readOnlyFields ?? {});
    }

    return { data: stamp(form, merge(data, template.data ?? {})), readOnlyFields: merge(readOnlyFields, template.readOnlyFields ?? {}) };
}

/** Keeps what the host holds beside the record for the given form, replacing what was kept. */
function setKept(identity: IFormIdentity, kept: Kept, values: ReadonlyArray<unknown>): void {
    sessionStorage.setItem(getStorageKey(identity, kept), JSON.stringify(values));
}

/** Keeps the presets the officer saved for the given form, replacing what was kept. Every one of them is theirs, so each is marked as personal. */
function setPersonalPresets(identity: IFormIdentity, presets: ReadonlyArray<IReportPreset<any>>): void {
    sessionStorage.setItem(getPresetsKey(identity), JSON.stringify(presets.map(preset => ({ ...preset, isPersonal: true }))));
}

/** A fixture is the target form's own contract, which carries no identity of its own, so the host stamps the one it is loading -- the same identity a save is stamped with. */
function stamp(form: IExampleForm<any>, data: object): IReportData {
    return { ...data, ...form.identity, status: "draft", type: form.type };
}
