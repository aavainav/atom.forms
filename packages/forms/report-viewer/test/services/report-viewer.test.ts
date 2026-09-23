import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuditRecord } from "@forms/audit";
import type { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { ControllerManager, FormDefinition, FormModel, IFormMapper, IReportData, Schema } from "@forms/core";
import type { IWorkflowStamp } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { WorkflowService } from "@forms/workflow";

import { IReportViewerOption, ReportViewerService } from "../../src/services/report-viewer";

const noopOption: Pick<IReportViewerOption, "title" | "Component"> = { title: "Stub option", Component: () => null };

function record(name: string): IReportData {
    return { name, status: "draft", type: "none", version: "1.0" };
}

const issuedWorkflow: IWorkflowStamp = {
    history: [{ at: 5, by: { id: "officer-1", name: "Officer One" }, from: "draft", to: "issued", transition: "issue" }],
    id: "stub-workflow",
    version: "1"
};

/**
 * A form with no pages of its own -- just enough for `loadForm` to resolve and initialize it. `mapper` is read off
 * a static slot rather than passed to the constructor, since a form model's constructor takes no arguments; each
 * test that needs a specific mapper (or none) sets the slot before constructing or loading the form.
 */
class StubFormModel extends FormModel<IReportData> {
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

/** A controller manager over a stub form, which is all the audit and review controllers the bundle is gathered from need. */
function stubControllers(): ControllerManager {
    const controllers = new ControllerManager();
    controllers.loadForm({ id: "form-1", mode: "editable", name: "Stub", status: "draft", version: "1.0" } as unknown as FormModel<any>);

    return controllers;
}

/** The service resolves the form itself now, so every test needs a catalog to resolve it from. */
function createService(catalogItem: IFormCatalogItem): ReportViewerService {
    const formCatalogService: IFormCatalogService = {
        catalogItems: new Map(),
        get: async () => ({ ...catalogItem, ...(await catalogItem.load()) }),
        getLatestVersions: async () => new Map([[catalogItem.name, catalogItem]])
    };

    return new ReportViewerService(formCatalogService, new WorkflowService());
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
            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: expect.objectContaining({ name: "Stub" }) }));
        });

        it("hands the read's readOnlyFields to the mapper", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), readOnlyFields: { name: true } }) });

            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ readOnlyFields: { name: true } }));
        });

        it("hands the read's status and workflow history to the mapper", async () => {
            const populate = stubMapper();
            const service = createService(catalogItem);

            await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), status: "issued", workflow: issuedWorkflow }) });

            expect(populate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: "issued", workflow: issuedWorkflow }));
        });

        it("leaves the form in the status the record was stored with, and with the history it kept", async () => {
            stubMapper();
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), status: "issued", workflow: issuedWorkflow }) });

            expect(initialForm.form.status).toBe("issued");
            expect(initialForm.form.history).toEqual(issuedWorkflow.history);
        });

        it("restores the status even when the form carries no mapper to populate", async () => {
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), status: "inReview" }) });

            expect(initialForm.form.status).toBe("inReview");
        });

        it("keeps the status the form was built with when the read carries none", async () => {
            stubMapper();
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.form.status).toBe("draft");
            expect(initialForm.form.history).toEqual([]);
        });

        it("refuses a record stored with a status no form can have", async () => {
            stubMapper();
            const service = createService(catalogItem);

            await expect(service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub"), status: "bogus" as never }) }))
                .rejects.toThrowError('"bogus" is not a status a form can have.');
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

        it("hands the audit history and the comments the data manager read along with the form", async () => {
            const audit: ReadonlyArray<AuditRecord> = [{ at: 1, form: { id: "form-0", name: "Stub", version: "1.0" }, id: "a-1", kind: "saved" }];
            const comments: ReadonlyArray<IReviewComment> = [{ at: 1, author: { id: "9", name: "Lt. Osei" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." }];
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ audit, comments, data: record("Stub") }) });

            expect(initialForm.audit).toBe(audit);
            expect(initialForm.comments).toBe(comments);
        });

        it("has no audit history or comments to hand along when the data manager read none", async () => {
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.audit).toBeUndefined();
            expect(initialForm.comments).toBeUndefined();
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

        it("writes the whole bundle in one call instead, when the data manager has a writeBundle and the controllers are given", async () => {
            const service = createService(catalogItem);
            const controllers = stubControllers();
            const write = vi.fn(async () => { });
            const writeBundle = vi.fn(async () => { });

            const data = await service.saveForm(new StubFormModel(), { read: async () => undefined, write, writeBundle }, controllers);

            expect(writeBundle).toHaveBeenCalledTimes(1);
            expect(writeBundle).toHaveBeenCalledWith(expect.objectContaining({ data, version: 1 }));
            expect(write).not.toHaveBeenCalled();
        });

        it("writes only the data when the data manager has a writeBundle but no controllers are given to build the bundle from", async () => {
            const service = createService(catalogItem);
            const write = vi.fn(async () => { });
            const writeBundle = vi.fn(async () => { });

            const data = await service.saveForm(new StubFormModel(), { read: async () => undefined, write, writeBundle });

            expect(write).toHaveBeenCalledWith(data);
            expect(writeBundle).not.toHaveBeenCalled();
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
            const service = createService(catalogItem);

            expect(service.canExtractData(new StubFormModel())).toBe(true);
        });

        it("is false without a mapper", () => {
            const service = createService(catalogItem);

            expect(service.canExtractData(new StubFormModel())).toBe(false);
        });
    });

    describe("canSaveForm", () => {
        it("is true with both a mapper and a data manager that writes", () => {
            stubMapper();
            const service = createService(catalogItem);

            expect(service.canSaveForm(new StubFormModel(), { read: async () => undefined, write: async () => { } })).toBe(true);
        });

        it("is false with a mapper but no data manager", () => {
            stubMapper();
            const service = createService(catalogItem);

            expect(service.canSaveForm(new StubFormModel())).toBe(false);
        });

        it("is true with a mapper and a data manager that only writes a bundle", () => {
            stubMapper();
            const service = createService(catalogItem);

            expect(service.canSaveForm(new StubFormModel(), { read: async () => undefined, writeBundle: async () => { } })).toBe(true);
        });

        it("is false with a data manager that only reads", () => {
            stubMapper();
            const service = createService(catalogItem);

            expect(service.canSaveForm(new StubFormModel(), { read: async () => undefined })).toBe(false);
        });
    });

    describe("getBundle", () => {
        it("gathers the form's data, the audit history and the comments into one object", () => {
            const service = createService(catalogItem);
            const controllers = stubControllers();
            const comment: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };
            getReviewController(controllers).load([comment]);

            const bundle = service.getBundle(new StubFormModel(), controllers);

            expect(bundle.version).toBe(1);
            expect(bundle.data.name).toBe(new StubFormModel().name);
            expect(bundle.comments).toEqual([comment]);
            expect(bundle.audit.map(entry => entry.kind)).toEqual(["form-opened"]);
            expect(bundle.exportedAt).toBeGreaterThan(0);
        });
    });

    describe("canReview", () => {
        const withComments = { read: async () => undefined, writeComments: async () => { } };

        it("is true for a reviewable form, whether or not the host can keep comments", () => {
            const service = createService(catalogItem);

            expect(service.canReview(new StubFormModel().setMode("reviewable"))).toBe(true);
            expect(service.canReview(new StubFormModel().setMode("reviewable"), withComments)).toBe(true);
        });

        it("is true for an editable form only when the host can keep comments for the officer to resolve", () => {
            const service = createService(catalogItem);

            expect(service.canReview(new StubFormModel())).toBe(false);
            expect(service.canReview(new StubFormModel(), { read: async () => undefined })).toBe(false);
            expect(service.canReview(new StubFormModel(), withComments)).toBe(true);
            expect(service.canReview(new StubFormModel(), { read: async () => undefined, writeBundle: async () => { } })).toBe(true);
        });

        it("is never true for a viewable form", () => {
            const service = createService(catalogItem);

            expect(service.canReview(new StubFormModel().setMode("viewable"), withComments)).toBe(false);
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

            service.registerOption({ id: "extract", ...noopOption, canShow: form => service.canExtractData(form) });
            service.registerOption({ id: "save", ...noopOption, canShow: (form, dataManager) => service.canSaveForm(form, dataManager) });

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
