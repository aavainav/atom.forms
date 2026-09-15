import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { FormDefinition, FormModel, IFormMapper, IReportData, Schema } from "@forms/core";

import { canExtractData, canSaveForm, IReportViewerOption, ReportViewerService } from "../../src/services/report-viewer";

const noopOption: Pick<IReportViewerOption, "title" | "Component"> = { title: "Stub option", Component: () => null };

function record(name: string): IReportData {
    return { name, status: "draft", type: "none", version: "1.0" };
}

/**
 * A form with no pages of its own -- just enough for `loadForm` to resolve and initialize it. `mapper` is read off
 * a static slot rather than passed to the constructor, since a form model's constructor takes no arguments; each
 * test that needs a specific mapper (or none) sets the slot before constructing or loading the form.
 */
class StubFormModel extends FormModel {
    static mapper: IFormMapper<StubFormModel, IReportData> | undefined = undefined;
    public readonly mapper: IFormMapper<StubFormModel, IReportData> | undefined = StubFormModel.mapper;
}

class StubSchema extends Schema {
}

// registers StubFormModel's definition once, at module scope -- Entity.set validates by reference identity, so a
// tree rebuilt per test would throw for any entity still holding the old definition.
new FormDefinition("stub-form", StubFormModel, {});

/** Builds a "Stub"@"1.0" catalog item whose `load` resolves StubFormModel/StubSchema without touching real files. */
function stubCatalogItem(): IFormCatalogItem {
    return {
        name: "Stub",
        description: "",
        type: "none",
        version: "1.0",
        load: async () => ({ ctor: StubFormModel, schema: StubSchema, component: (() => null) as never })
    };
}

/** Wires a spy mapper onto StubFormModel for the life of one test and returns its `populate` spy. */
function stubMapper(): ReturnType<typeof vi.fn> {
    const populate = vi.fn(async (form: StubFormModel) => form);
    StubFormModel.mapper = { extract: () => ({} as IReportData), populate };
    return populate;
}

/** The service resolves the form itself now, so every test needs a catalog to resolve it from. */
function createService(catalogItem: IFormCatalogItem): ReportViewerService {
    const formCatalogService: IFormCatalogService = {
        catalogItems: new Map(),
        get: async () => ({ ...catalogItem, ...(await catalogItem.load()) }),
        getLatestVersions: async () => new Map([[catalogItem.name, catalogItem]])
    };

    return new ReportViewerService(formCatalogService);
}

describe("ReportViewerService", () => {
    const catalogItem = stubCatalogItem();

    beforeEach(() => {
        StubFormModel.mapper = undefined;
    });

    describe("loadForm", () => {
        it("resolves the identified form from the catalog and populates it with what the data manager reads", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub", version: "1.0" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), undefined);
        });

        it("hands the read's readOnlyFields to the mapper as a set", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), readOnlyFields: ["name"] }) });

            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.anything(), new Set(["name"]));
        });

        it("builds a form without populating it when there is no data manager", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" });

            expect(populate).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the data manager reads nothing", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => undefined });

            expect(populate).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the form carries no mapper", async () => {
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.form).toBeInstanceOf(StubFormModel);
        });
    });

    describe("saveForm", () => {
        it("hands the extracted data to the data manager", async () => {
            stubMapper();
            const service = createService(catalogItem);
            const write = vi.fn(async () => { });

            const data = await service.saveForm(new StubFormModel(), { read: async () => undefined, write });

            expect(write).toHaveBeenCalledWith(data);
        });

        it("returns the extracted data even with nothing to write it to", async () => {
            const service = createService(catalogItem);

            const data = await service.saveForm(new StubFormModel());

            expect(data.name).toBe(new StubFormModel().name);
        });
    });

    describe("canExtractData", () => {
        it("is true once the form carries a mapper", () => {
            stubMapper();

            expect(canExtractData(new StubFormModel())).toBe(true);
        });

        it("is false without a mapper", () => {
            expect(canExtractData(new StubFormModel())).toBe(false);
        });
    });

    describe("canSaveForm", () => {
        it("is true with both a mapper and a data manager that writes", () => {
            stubMapper();

            expect(canSaveForm(new StubFormModel(), { read: async () => undefined, write: async () => { } })).toBe(true);
        });

        it("is false with a mapper but no data manager", () => {
            stubMapper();

            expect(canSaveForm(new StubFormModel())).toBe(false);
        });

        it("is false with a data manager that only reads", () => {
            stubMapper();

            expect(canSaveForm(new StubFormModel(), { read: async () => undefined })).toBe(false);
        });
    });

    describe("registerOption / getOptions", () => {
        // the production option list lives in ReportViewerModule.configure now rather than on the service, so
        // these register a small stand-in set through the same registration seam a module uses, reusing the two
        // real gates (canExtractData/canSaveForm) rather than the module's specific six ids
        it("offers an option with no canShow unconditionally", () => {
            const service = createService(catalogItem);

            service.registerOption({ id: "always", ...noopOption });

            expect(service.getOptions(new StubFormModel()).map(option => option.id)).toEqual(["always"]);
        });

        it("filters an option by its canShow, in registration order", () => {
            stubMapper();
            const service = createService(catalogItem);

            service.registerOption({ id: "extract", ...noopOption, canShow: canExtractData });
            service.registerOption({ id: "save", ...noopOption, canShow: canSaveForm });

            const form = new StubFormModel();
            const withoutManager = service.getOptions(form).map(option => option.id);
            const withManager = service.getOptions(form, { read: async () => undefined, write: async () => { } }).map(option => option.id);

            expect(withoutManager).toEqual(["extract"]);
            expect(withManager).toEqual(["extract", "save"]);
        });

        it("throws when the same id is registered twice", () => {
            const service = createService(catalogItem);

            service.registerOption({ id: "dup", ...noopOption });

            expect(() => service.registerOption({ id: "dup", ...noopOption })).toThrow();
        });
    });
});
