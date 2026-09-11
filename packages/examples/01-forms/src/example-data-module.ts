import { IModule, IModuleConfigurator } from "@shrub/core";
import { IReportViewerData } from "@forms/core";
import { IFormDataContext, IFormDefaults, IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

import { mockCitations } from "./mock-citation-data";
import { mockGAUTCRecords } from "./mock-ga-utc-data";
import { mockPublicContactOrWarningRecords } from "./mock-public-contact-or-warning-data";
import { mockTR310Records } from "./mock-tr310-data";

/**
 * The fixtures each form's route is served from, together with the identity and form type a record loaded for it
 * is stamped with.
 *
 * Keyed by route rather than by anything in the data context, because a context carries only the matched route's
 * params and query string and every form route is a static path with neither. A host fetching from a real source
 * already knows which record it is asking for.
 *
 * The **last** entry is also the fallback `getForm()` serves to any unmatched route, which is what keeps `/`
 * rendering a form at all - so add a new entry above it rather than after it, or `/` quietly changes form.
 */
const forms = [
    {
        path: "ga/utc",
        identity: { name: "GA Uniform Traffic Citation", version: "1.0" },
        type: "citation",
        records: mockGAUTCRecords,
        defaults: undefined
    },
    {
        path: "sc/432",
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
        path: "sc/tr310",
        identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" },
        type: "crash",
        records: mockTR310Records,
        defaults: undefined
    },
    {
        path: "sc/s438",
        identity: { name: "S438 Citation Form", version: "1.0" },
        type: "citation",
        records: mockCitations,
        defaults: undefined
    }
] as const;

/**
 * Demonstrates how a host app both supplies report data to the report viewer and persists it back again.
 *
 * The provider maps whatever raw data the host has into the contract the target form publishes - here, one of
 * the fixtures in mock-public-contact-or-warning-data.ts or mock-citation-data.ts - and the sink takes what the
 * form gives back. The sink stores to sessionStorage and the provider prefers a stored record over the fixture,
 * so the whole round trip can be seen without a server: load, edit, save, reload.
 *
 * Switch scenarios with `?record=full` or `?record=minimal`. Clear a saved record with `?record=full&reset=1`.
 * `?record=new` demonstrates a host's configured defaults for a record that does not exist yet - and which of
 * their fields it has locked - e.g. `/sc/432?record=new&reset=1`.
 */
export class ExampleDataModule implements IModule {
    readonly name = "example-data";
    readonly dependencies = [ReportViewerModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);

        reportViewer.registerDataReader({
            getData: async context => {
                if (context.searchParams.has("reset")) {
                    sessionStorage.removeItem(getStorageKey());
                }

                return getSavedData() ?? getFixtureData(context);
            },
            getDefaultData: async () => getDefaultFixtureData()
        });

        reportViewer.registerDataWriter({
            saveData: async data => sessionStorage.setItem(getStorageKey(), JSON.stringify(data))
        });
    }
}

/** Returns the fixture for the form being rendered, chosen by the route the browser is on, or undefined for the `new` scenario so getData falls through to getDefaultData. */
function getFixtureData(context: IFormDataContext): IReportViewerData | undefined {
    const scenario = context.searchParams.get("record") ?? context.searchParams.get("citation") ?? "full";

    if (scenario === "new") {
        return undefined;
    }

    const form = getForm();

    // each fixture is the target form's own contract, which carries no identity of its own, so the host stamps
    // the one it is asking for - the same identity saveForm stamps a saved record with.
    return {
        ...(form.records[scenario] ?? form.records.full),
        ...form.identity,
        status: "draft",
        type: form.type
    };
}

/** Returns the values a brand new record for the form being rendered should start with, or undefined for a form with no defaults configured. */
function getDefaultFixtureData(): IFormDefaults | undefined {
    const form = getForm();

    if (!form.defaults) {
        return undefined;
    }

    return {
        data: { ...form.defaults.data, ...form.identity, status: "draft", type: form.type },
        readOnlyFields: form.defaults.readOnlyFields
    };
}

/** Returns the form the browser is on, falling back to the last entry so an unmatched route still serves something. */
function getForm(): (typeof forms)[number] {
    return forms.find(form => window.location.pathname.includes(form.path)) ?? forms[forms.length - 1];
}

/** Returns the record last saved for the form being rendered, or undefined when nothing has been saved for it. */
function getSavedData(): IReportViewerData | undefined {
    const saved = sessionStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) as IReportViewerData : undefined;
}

/** Keyed by route so a record saved for one form is never read back into another. */
function getStorageKey(): string {
    return `example-data:${window.location.pathname}`;
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(ExampleDataModule);
