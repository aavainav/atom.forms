import { IModule, IServiceRegistration } from "@shrub/core";
import { IFormDataContext, IFormDataHooks, IFormDataReader, IFormDataWriter, IFormDefaults } from "@forms/catalog";
import { IFormIdentity, IReportViewerData } from "@forms/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

import { mockCitations } from "./mock-citation-data";
import { mockGAUTCRecords } from "./mock-ga-utc-data";
import { mockPublicContactOrWarningRecords } from "./mock-public-contact-or-warning-data";
import { mockTR310Records } from "./mock-tr310-data";

/**
 * The fixtures each form is served from, together with the identity and form type a record loaded for it is
 * stamped with. `ExampleDataService` looks a form up here by identity when it's asked for a reader/writer, so a
 * form with no entry here simply gets neither - `ok/parking` and `ok/traffic` render with no data rather than
 * quietly borrowing another form's fixture.
 */
const forms = [
    {
        identity: { name: "GA Uniform Traffic Citation", version: "1.0" },
        type: "citation",
        records: mockGAUTCRecords,
        defaults: undefined
    },
    {
        identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" },
        type: "none",
        records: mockPublicContactOrWarningRecords,
        // this agency only ever issues warnings out of Columbia, so a new record's agency name is a settled fact
        // and locked; the city stays editable in case an officer is typing up a record for a different one.
        defaults: {
            data: { agencyCity: "Columbia", agencyName: "Columbia Police Department" },
            readOnlyFields: new Set(["agencyName"])
        }
    },
    {
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        type: "crash",
        records: mockTR310Records,
        defaults: undefined
    },
    {
        identity: { name: "S438 Citation Form", version: "1.0" },
        type: "citation",
        records: mockCitations,
        defaults: undefined
    }
] as const;

type FormEntry = (typeof forms)[number];

/**
 * Demonstrates how a host implements `IFormDataHooks` to supply report data to the report viewer and persist it
 * back again, without the form packages themselves knowing anything about sessionStorage or this fixture table.
 * Each form's own route loader asks this service for a reader/writer and attaches whichever it gets back onto the
 * catalog item it resolved, before handing it to the report viewer.
 *
 * The reader maps whatever raw data the host has into the contract the target form publishes - here, one of the
 * fixtures in mock-public-contact-or-warning-data.ts or mock-citation-data.ts - and the writer takes what the form
 * gives back. The writer stores to sessionStorage and the reader prefers a stored record over the fixture, so the
 * whole round trip can be seen without a server: load, edit, save, reload.
 *
 * Switch scenarios with `?record=full` or `?record=minimal`. Clear a saved record with `?record=full&reset=1`.
 * `?record=new` demonstrates a host's configured defaults for a record that does not exist yet - and which of
 * their fields it has locked - e.g. `/sc/432?record=new&reset=1`.
 */
class ExampleDataService implements IFormDataHooks {
    getDataReader(identity: IFormIdentity): IFormDataReader | undefined {
        const form = findForm(identity);

        if (!form) {
            return undefined;
        }

        return {
            getData: async context => {
                if (context.searchParams.has("reset")) {
                    sessionStorage.removeItem(getStorageKey(form.identity));
                }

                return getSavedData(form.identity) ?? getFixtureData(form, context);
            },
            getDefaultData: async () => getDefaultFixtureData(form)
        };
    }

    getDataWriter(identity: IFormIdentity): IFormDataWriter | undefined {
        const form = findForm(identity);

        if (!form) {
            return undefined;
        }

        return { saveData: async data => sessionStorage.setItem(getStorageKey(form.identity), JSON.stringify(data)) };
    }
}

export class ExampleDataModule implements IModule {
    readonly name = "example-data";
    readonly dependencies = [ReportViewerModule];

    configureServices(registration: IServiceRegistration): void {
        registration.registerInstance<IFormDataHooks, ExampleDataService>(IFormDataHooks, new ExampleDataService());
    }
}

/** Returns the fixture table entry matching an identity's name and version, if this host has one. */
function findForm({ name, version }: IFormIdentity): FormEntry | undefined {
    return forms.find(form => form.identity.name === name && form.identity.version === version);
}

/** Returns the fixture for the given form, chosen by the scenario in the query string, or undefined for the `new` scenario so getData falls through to getDefaultData. */
function getFixtureData(form: FormEntry, context: IFormDataContext): IReportViewerData | undefined {
    const scenario = context.searchParams.get("record") ?? context.searchParams.get("citation") ?? "full";

    if (scenario === "new") {
        return undefined;
    }

    // each fixture is the target form's own contract, which carries no identity of its own, so the host stamps
    // the one it is asking for - the same identity saveForm stamps a saved record with.
    return {
        ...(form.records[scenario] ?? form.records.full),
        ...form.identity,
        status: "draft",
        type: form.type
    };
}

/** Returns the values a brand new record for the given form should start with, or undefined for a form with no defaults configured. */
function getDefaultFixtureData(form: FormEntry): IFormDefaults | undefined {
    if (!form.defaults) {
        return undefined;
    }

    return {
        data: { ...form.defaults.data, ...form.identity, status: "draft", type: form.type },
        readOnlyFields: form.defaults.readOnlyFields
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

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(ExampleDataModule);
