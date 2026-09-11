import { describe, expect, it, vi } from "vitest";

import { FormCatalogService } from "@forms/catalog";
import { FormDefinition, FormModel, IFormMapper, IReportViewerData, Schema } from "@forms/core";

import type { INavigationRegistrationService } from "../../src/services/navigation";
import type { IFormDataContext } from "../../src/services/report-viewer";
import type { IFormDefaults, IReportViewerOptions } from "../../src/options";
import { ReportViewerService } from "../../src/services/report-viewer";

const context: IFormDataContext = { params: {}, searchParams: new URLSearchParams() };

function record(name: string): IReportViewerData {
    return { name, status: "draft", type: "none", version: "1.0" };
}

/** A form with no pages of its own -- just enough for `loadForm` to resolve and initialize it. */
class StubFormModel extends FormModel {
}

class StubSchema extends Schema {
}

// registers StubFormModel's definition once, at module scope -- Entity.set validates by reference identity, so a
// tree rebuilt per test would throw for any entity still holding the old definition.
new FormDefinition("stub-form", StubFormModel);

class StubFormFactory {
    readonly name = "Stub";
    readonly version = "1.0";
    createForm(): StubFormModel {
        return new StubFormModel();
    }
    getPageTypes(): Map<string, never> {
        return new Map<string, never>();
    }
}

function createService(options: IReportViewerOptions = {}): { formCatalogService: FormCatalogService; service: ReportViewerService } {
    const formCatalogService = new FormCatalogService();
    const service = new ReportViewerService(
        formCatalogService,
        { registerChildRoute: vi.fn() } as unknown as INavigationRegistrationService,
        options
    );

    return { formCatalogService, service };
}

/** Registers "Stub"@"1.0" with the given catalog and service, with a mapper whose populate is a spy returning the form unchanged. */
function registerStubForm(formCatalogService: FormCatalogService, service: ReportViewerService): { populate: ReturnType<typeof vi.fn> } {
    formCatalogService.registerCatalogItem({
        name: "Stub",
        description: "",
        version: "1.0",
        ctor: StubFormModel,
        schema: StubSchema,
        formFactory: StubFormFactory,
        component: async () => (() => null) as never
    });

    const populate = vi.fn(async (form: StubFormModel) => form);
    const mapper: IFormMapper<StubFormModel, IReportViewerData> = { extract: () => ({} as IReportViewerData), populate };

    service.registerMapper({ name: "Stub", version: "1.0" }, mapper);

    return { populate };
}

describe("ReportViewerService", () => {
    describe("getData", () => {
        it("returns the registered reader's result", async () => {
            const { service } = createService();
            const data = record("Alpha");
            service.registerDataReader({ getData: async () => data });

            expect(await service.getData(context)).toBe(data);
        });

        it("falls back to options.data when no reader is registered", async () => {
            const data = record("Alpha");
            const { service } = createService({ data });

            expect(await service.getData(context)).toBe(data);
        });

        /** Characterization: options.data is the fallback for having no reader at all, not for a reader that found nothing. */
        it("does not fall back to options.data when a registered reader resolves undefined", async () => {
            const { service } = createService({ data: record("Alpha") });
            service.registerDataReader({ getData: async () => undefined });

            expect(await service.getData(context)).toBeUndefined();
        });
    });

    describe("getDefaultData", () => {
        it("returns the reader's getDefaultData result when it implements one", async () => {
            const defaults: IFormDefaults = { data: record("Alpha") };
            const { service } = createService();
            service.registerDataReader({ getData: async () => undefined, getDefaultData: async () => defaults });

            expect(await service.getDefaultData(context)).toBe(defaults);
        });

        it("falls back to options.defaultData when no reader is registered", async () => {
            const defaultData: IFormDefaults = { data: record("Alpha") };
            const { service } = createService({ defaultData });

            expect(await service.getDefaultData(context)).toBe(defaultData);
        });

        it("falls back to options.defaultData when a reader is registered but does not implement getDefaultData", async () => {
            const defaultData: IFormDefaults = { data: record("Alpha") };
            const { service } = createService({ defaultData });
            service.registerDataReader({ getData: async () => undefined });

            expect(await service.getDefaultData(context)).toBe(defaultData);
        });

        it("resolves undefined when neither a reader nor options configure defaults", async () => {
            const { service } = createService();

            expect(await service.getDefaultData(context)).toBeUndefined();
        });
    });

    describe("loadFormReport", () => {
        it("resolves undefined when neither source has anything and no identity is given", async () => {
            const { service } = createService();

            expect(await service.loadFormReport(context)).toBeUndefined();
        });

        it("loads using getData's result when it resolves data", async () => {
            const { formCatalogService, service } = createService();
            const { populate } = registerStubForm(formCatalogService, service);
            service.registerDataReader({ getData: async () => record("Stub") });

            const initialForm = await service.loadFormReport(context);

            expect(initialForm?.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), undefined);
        });

        it("falls back to getDefaultData's result, and its readOnlyFields, when getData resolves undefined", async () => {
            const { formCatalogService, service } = createService();
            const { populate } = registerStubForm(formCatalogService, service);
            const readOnlyFields = new Set(["someField"]);
            service.registerDataReader({
                getData: async () => undefined,
                getDefaultData: async () => ({ data: record("Stub"), readOnlyFields })
            });

            const initialForm = await service.loadFormReport(context);

            expect(initialForm?.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), readOnlyFields);
        });

        it("never calls getDefaultData when getData already found data", async () => {
            const { formCatalogService, service } = createService();
            registerStubForm(formCatalogService, service);
            const getDefaultData = vi.fn(async () => undefined);
            service.registerDataReader({ getData: async () => record("Stub"), getDefaultData });

            await service.loadFormReport(context);

            expect(getDefaultData).not.toHaveBeenCalled();
        });

        it("uses a given identity's name over the default data's own", async () => {
            const { formCatalogService, service } = createService();
            const { populate } = registerStubForm(formCatalogService, service);
            service.registerDataReader({
                getData: async () => undefined,
                getDefaultData: async () => ({ data: record("NotStub") })
            });

            const initialForm = await service.loadFormReport(context, { name: "Stub" });

            expect(initialForm?.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "NotStub" }), undefined);
        });
    });
});
