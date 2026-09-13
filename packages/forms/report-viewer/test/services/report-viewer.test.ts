import { describe, expect, it, vi } from "vitest";

import type { IFormCatalogItem, IFormDataContext, IFormDataReader } from "@forms/catalog";
import { FormDefinition, FormModel, IFormMapper, IReportViewerData, Schema } from "@forms/core";

import type { IReportViewerOptions } from "../../src/options";
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

function createService(options: IReportViewerOptions = {}): ReportViewerService {
    return new ReportViewerService(options);
}

/** Builds a "Stub"@"1.0" catalog item with a mapper whose populate is a spy returning the form unchanged, and whatever data reader is given. */
function stubCatalogItem(dataReader?: IFormDataReader): { catalogItem: IFormCatalogItem<StubFormModel>; populate: ReturnType<typeof vi.fn> } {
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
            mapper,
            dataReader
        },
        populate
    };
}

describe("ReportViewerService", () => {
    describe("loadForm", () => {
        it("builds and populates a form from the given data", async () => {
            const service = createService();
            const { catalogItem, populate } = stubCatalogItem();

            const initialForm = await service.loadForm(catalogItem, record("Stub"));

            expect(initialForm.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), undefined);
        });

        it("builds a form without populating it when there is no data", async () => {
            const service = createService();
            const { catalogItem, populate } = stubCatalogItem();

            await service.loadForm(catalogItem, undefined);

            expect(populate).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the catalog item has no mapper", async () => {
            const service = createService();
            const { catalogItem } = stubCatalogItem();
            const withoutMapper = { ...catalogItem, mapper: undefined };

            const initialForm = await service.loadForm(withoutMapper, record("Stub"));

            expect(initialForm.form).toBeInstanceOf(StubFormModel);
        });
    });

    describe("loadFormReport", () => {
        it("loads using the catalog item's reader result", async () => {
            const service = createService();
            const { catalogItem, populate } = stubCatalogItem({ getData: async () => record("Stub") });

            const initialForm = await service.loadFormReport(catalogItem, context);

            expect(initialForm.catalogItem.name).toBe("Stub");
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), undefined);
        });

        it("falls back to the reader's getDefaultData result, and its readOnlyFields, when getData resolves undefined", async () => {
            const service = createService();
            const readOnlyFields = new Set(["someField"]);
            const { catalogItem, populate } = stubCatalogItem({
                getData: async () => undefined,
                getDefaultData: async () => ({ data: record("Stub"), readOnlyFields })
            });

            await service.loadFormReport(catalogItem, context);

            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: "Stub" }), readOnlyFields);
        });

        it("never calls getDefaultData when getData already found data", async () => {
            const service = createService();
            const getDefaultData = vi.fn(async () => undefined);
            const { catalogItem } = stubCatalogItem({ getData: async () => record("Stub"), getDefaultData });

            await service.loadFormReport(catalogItem, context);

            expect(getDefaultData).not.toHaveBeenCalled();
        });

        it("builds a form without populating it when the catalog item has no reader", async () => {
            const service = createService();
            const { catalogItem, populate } = stubCatalogItem();

            await service.loadFormReport(catalogItem, context);

            expect(populate).not.toHaveBeenCalled();
        });
    });

    describe("canExtractData", () => {
        it("is true once the catalog item carries a mapper", () => {
            const service = createService();
            const { catalogItem } = stubCatalogItem();

            expect(service.canExtractData(catalogItem)).toBe(true);
        });

        it("is false without a mapper", () => {
            const service = createService();
            const { catalogItem } = stubCatalogItem();

            expect(service.canExtractData({ ...catalogItem, mapper: undefined })).toBe(false);
        });
    });

    describe("canSaveForm", () => {
        it("is true once the catalog item carries both a mapper and a data writer", () => {
            const service = createService();
            const { catalogItem } = stubCatalogItem();

            expect(service.canSaveForm({ ...catalogItem, dataWriter: { saveData: async () => { } } })).toBe(true);
        });

        it("is false with a mapper but no data writer", () => {
            const service = createService();
            const { catalogItem } = stubCatalogItem();

            expect(service.canSaveForm(catalogItem)).toBe(false);
        });
    });
});
