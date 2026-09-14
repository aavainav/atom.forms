import { describe, expect, it, vi } from "vitest";

import type { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { FormDefinition, FormModel, IFormMapper, IReportViewerData, Schema } from "@forms/core";

import { canExtractData, canSaveForm, IReportViewerOption, ReportViewerService } from "../../src/services/report-viewer";

const noopOption: Pick<IReportViewerOption, "title" | "Component"> = { title: "Stub option", Component: () => null };

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

/** Builds a "Stub"@"1.0" catalog item with a mapper whose populate is a spy returning the form unchanged. */
function stubCatalogItem(): { catalogItem: IFormCatalogItem<StubFormModel>; populate: ReturnType<typeof vi.fn> } {
    const populate = vi.fn(async (form: StubFormModel) => form);
    const mapper: IFormMapper<StubFormModel, IReportViewerData> = { extract: () => ({} as IReportViewerData), populate };

    return {
        catalogItem: {
            name: "Stub",
            description: "",
            type: "none",
            version: "1.0",
            ctor: StubFormModel,
            schema: StubSchema,
            formFactory: StubFormFactory,
            component: async () => (() => null) as never,
            mapper
        },
        populate
    };
}

/** The service resolves the form itself now, so every test needs a catalog to resolve it from. */
function createService(catalogItem: IFormCatalogItem): ReportViewerService {
    const formCatalogService: IFormCatalogService = {
        catalogItems: new Map(),
        get: async () => catalogItem as IFormCatalogItem,
        getLatestVersions: async () => new Map([[catalogItem.name, catalogItem as IFormCatalogItem]])
    };

    return new ReportViewerService(formCatalogService);
}

describe("ReportViewerService", () => {
    describe("loadForm", () => {
        it("resolves the identified form from the catalog and populates it with what the data manager reads", async () => {
            const { catalogItem, populate } = stubCatalogItem();
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub", version: "1.0" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), undefined);
        });

        it("hands the read's readOnlyFields to the mapper as a set", async () => {
            const { catalogItem, populate } = stubCatalogItem();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), readOnlyFields: ["name"] }) });

            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.anything(), new Set(["name"]));
        });

        it("builds a form without populating it when there is no data manager", async () => {
            const { catalogItem, populate } = stubCatalogItem();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" });

            expect(populate).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the data manager reads nothing", async () => {
            const { catalogItem, populate } = stubCatalogItem();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => undefined });

            expect(populate).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the catalog item has no mapper", async () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService({ ...catalogItem, mapper: undefined } as IFormCatalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.form).toBeInstanceOf(StubFormModel);
        });
    });

    describe("saveForm", () => {
        it("hands the extracted data to the data manager", async () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService(catalogItem);
            const write = vi.fn(async () => { });

            const data = await service.saveForm(new StubFormModel(), catalogItem as IFormCatalogItem, { read: async () => undefined, write });

            expect(write).toHaveBeenCalledWith(data);
        });

        it("returns the extracted data even with nothing to write it to", async () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService(catalogItem);

            const data = await service.saveForm(new StubFormModel(), catalogItem as IFormCatalogItem);

            expect(data.name).toBe(new StubFormModel().name);
        });
    });

    describe("canExtractData", () => {
        it("is true once the catalog item carries a mapper", () => {
            const { catalogItem } = stubCatalogItem();

            expect(createService(catalogItem).canExtractData(catalogItem as IFormCatalogItem)).toBe(true);
        });

        it("is false without a mapper", () => {
            const { catalogItem } = stubCatalogItem();

            expect(createService(catalogItem).canExtractData({ ...catalogItem, mapper: undefined } as IFormCatalogItem)).toBe(false);
        });
    });

    describe("canSaveForm", () => {
        it("is true with both a mapper and a data manager that writes", () => {
            const { catalogItem } = stubCatalogItem();

            expect(createService(catalogItem).canSaveForm(catalogItem as IFormCatalogItem, { read: async () => undefined, write: async () => { } })).toBe(true);
        });

        it("is false with a mapper but no data manager", () => {
            const { catalogItem } = stubCatalogItem();

            expect(createService(catalogItem).canSaveForm(catalogItem as IFormCatalogItem)).toBe(false);
        });

        it("is false with a data manager that only reads", () => {
            const { catalogItem } = stubCatalogItem();

            expect(createService(catalogItem).canSaveForm(catalogItem as IFormCatalogItem, { read: async () => undefined })).toBe(false);
        });
    });

    describe("registerOption / getOptions", () => {
        // the production option list lives in ReportViewerModule.configure now rather than on the service, so
        // these register a small stand-in set through the same IReportViewerOptionRegistration seam a module uses,
        // reusing the two real gates (canExtractData/canSaveForm) rather than the module's specific six ids
        it("offers an option with no canShow unconditionally", () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService(catalogItem);

            service.registerOption({ id: "always", ...noopOption });

            expect(service.getOptions(catalogItem as IFormCatalogItem).map(option => option.id)).toEqual(["always"]);
        });

        it("filters an option by its canShow, in registration order", () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService(catalogItem);

            service.registerOption({ id: "extract", ...noopOption, canShow: canExtractData });
            service.registerOption({ id: "save", ...noopOption, canShow: canSaveForm });

            const withoutManager = service.getOptions(catalogItem as IFormCatalogItem).map(option => option.id);
            const withManager = service.getOptions(catalogItem as IFormCatalogItem, { read: async () => undefined, write: async () => { } }).map(option => option.id);

            expect(withoutManager).toEqual(["extract"]);
            expect(withManager).toEqual(["extract", "save"]);
        });

        it("throws when the same id is registered twice", () => {
            const { catalogItem } = stubCatalogItem();
            const service = createService(catalogItem);

            service.registerOption({ id: "dup", ...noopOption });

            expect(() => service.registerOption({ id: "dup", ...noopOption })).toThrow();
        });
    });
});
