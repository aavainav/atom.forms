import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuditController } from "@forms/audit";
import type { AuditRecord } from "@forms/audit";
import type { IFormCatalogItem, IFormCatalogService } from "@forms/catalog";
import { ControllerManager, FormDefinition, FormModel, IFormMapper, IReportData, RuleIssueCollection, RuleIssueSeverity, Schema } from "@forms/core";
import type { IActor, IRuleIssue, IWorkflowEntry, IWorkflowStamp } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { WorkflowService } from "@forms/workflow";

import { IInitialForm, IReportViewerDataManager, IReportViewerOption, ReportViewerService } from "../../src/services/report-viewer";
import { WorkflowStubForm } from "../fixtures/workflow-form";

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
    controllers.loadForm({ id: "form-1", mode: "editable", name: "Stub", status: "draft", version: "1.0" } as FormModel<any>);

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
            const audit: ReadonlyArray<AuditRecord> = [{ at: 1, form: { id: "form-0", name: "Stub", revision: 0, version: "1.0" }, id: "a-1", kind: "saved" }];
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

        it("says why the host was asked, and whether it had a record to give", async () => {
            const service = createService(catalogItem);

            expect(await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) })).toMatchObject({ hasRecord: true, reason: "open" });
            expect(await service.loadForm({ name: "Stub" }, { read: async () => undefined })).toMatchObject({ hasRecord: false, reason: "open" });
            expect(await service.loadForm({ name: "Stub" }, undefined, "new")).toMatchObject({ hasRecord: false, reason: "new" });
        });

        it("builds a form without populating it when the form carries no mapper", async () => {
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) });

            expect(initialForm.form).toBeInstanceOf(StubFormModel);
        });

        it("gives the data manager the template a new form was asked to start from, and says which it was", async () => {
            const read = vi.fn(async () => ({ data: record("Stub") }));
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read }, "new", "speeding");

            expect(read).toHaveBeenCalledWith("new", "speeding");
            expect(initialForm.template).toBe("speeding");
        });

        it("asks the data manager for no template, and names none, when none was asked for", async () => {
            const read = vi.fn(async () => ({ data: record("Stub") }));
            const service = createService(catalogItem);

            const initialForm = await service.loadForm({ name: "Stub" }, { read }, "new");

            expect(read).toHaveBeenCalledWith("new", undefined);
            expect(initialForm.template).toBeUndefined();
        });

        it("reshapes the form as the variant asked for before the data goes in, and says which it was", async () => {
            const order: Array<string> = [];
            const populate = stubMapper().mockImplementation(async (form: StubFormModel) => { order.push("populate"); return form; });
            const applyVariant = vi.spyOn(StubFormModel.prototype, "applyVariant").mockImplementation(async function (this: StubFormModel) { order.push("variant"); return this; });
            const service = createService(catalogItem);

            try {
                const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => ({ data: record("Stub") }) }, "new", "speeding", "trial");

                expect(applyVariant).toHaveBeenCalledWith("trial");
                expect(populate).toHaveBeenCalled();
                expect(order).toEqual(["variant", "populate"]);
                expect(initialForm.variant).toBe("trial");
            }
            finally {
                applyVariant.mockRestore();
            }
        });

        it("leaves the form as it was built when no variant was asked for", async () => {
            const applyVariant = vi.spyOn(StubFormModel.prototype, "applyVariant");
            const service = createService(catalogItem);

            try {
                const initialForm = await service.loadForm({ name: "Stub" }, { read: async () => undefined }, "new");

                expect(applyVariant).not.toHaveBeenCalled();
                expect(initialForm.variant).toBeUndefined();
            }
            finally {
                applyVariant.mockRestore();
            }
        });
    });

    describe("getArrival", () => {
        const audit: ReadonlyArray<AuditRecord> = [
            { at: 1, form: { id: "form-0", name: "Stub", revision: 0, version: "1.0" }, id: "a-1", kind: "saved" },
            { at: 2, form: { id: "form-0", name: "Stub", revision: 0, version: "1.0" }, id: "a-2", kind: "saved" }
        ];
        const comments: ReadonlyArray<IReviewComment> = [{ at: 1, author: { id: "9", name: "Lt. Osei" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." }];
        const entry: IWorkflowEntry = { at: 5, by: { id: "officer-1", name: "Officer One" }, from: "draft", to: "inReview", transition: "submit" };

        /** What the report viewer loads for a form the host had no record for; a test says what else it arrived with. */
        const load = async (service: ReportViewerService): Promise<IInitialForm> => service.loadForm({ name: "Stub" });

        it("says the form was loaded, with how much came with the record, when the host had one", async () => {
            const service = createService(catalogItem);
            const base = await load(service);
            const form = Object.assign(base.form, { history: [entry, entry, entry] });

            expect(service.getArrival({ ...base, audit, comments, form, hasRecord: true })).toEqual({
                auditRecords: 2,
                comments: 1,
                formId: form.id ?? "",
                kind: "loaded",
                transitions: 3
            });
        });

        it("counts nothing for what did not come with the record", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, hasRecord: true })).toEqual({ auditRecords: 0, comments: 0, formId: base.form.id ?? "", kind: "loaded", transitions: 0 });
        });

        it("says the form was started when the host had no record", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival(base)).toEqual({ formId: base.form.id ?? "", kind: "started", reason: "open" });
        });

        it("says a new form was started even when the host gave it defaults to start from", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, hasRecord: true, reason: "new" })).toEqual({ formId: base.form.id ?? "", kind: "started", reason: "new" });
        });

        it("names the template a new form was started from", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, hasRecord: true, reason: "new", template: "speeding" })).toEqual({ formId: base.form.id ?? "", kind: "started", reason: "new", template: "speeding" });
        });

        it("names the variant a new form was started as, and none when it had none", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, reason: "new", variant: "trial" })).toEqual({ formId: base.form.id ?? "", kind: "started", reason: "new", variant: "trial" });
            expect(service.getArrival({ ...base, reason: "new" })).not.toHaveProperty("variant");
        });

        it("names no template when the form was not started from one, rather than an empty one", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, reason: "new" })).not.toHaveProperty("template");
        });

        it("names no template for a form that was loaded, whatever it was asked for", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, hasRecord: true, template: "speeding" })).not.toHaveProperty("template");
        });

        it("names no form when the form has no id", async () => {
            const service = createService(catalogItem);
            const base = await load(service);

            expect(service.getArrival({ ...base, form: Object.assign(base.form, { id: undefined }) }).formId).toBe("");
        });
    });

    describe("opening a form", () => {
        const held: AuditRecord = { at: 1, form: { id: "form-0", name: "Stub", revision: 0, version: "1.0" }, id: "old-1", kind: "saved" };
        const comment: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Left over." };

        /** A report in the controllers, as the viewer holds one, and a new one, as loaded, to put in its place. */
        async function open(template?: string) {
            const service = createService(catalogItem);
            const controllers = new ControllerManager();
            controllers.loadForm((await service.loadForm({ name: "Stub" })).form);
            const started = await service.loadForm({ name: "Stub" }, undefined, "new", template);

            return { controllers, loaded: { ...started, audit: [held], comments: [comment] }, service };
        }

        const ids = (controllers: ControllerManager): Array<string> => getAuditController(controllers).history.map(record => record.id);

        describe("openForm", () => {
            it("puts the form in place of the one the controllers hold", async () => {
                const { controllers, loaded, service } = await open();

                service.openForm(controllers, loaded);

                expect(controllers.getFormController().form).toBe(loaded.form);
            });

            it("says how it arrived first, so the audit records the old form closing and then the new one starting", async () => {
                const { controllers, loaded, service } = await open();

                service.openForm(controllers, loaded);

                const { session } = getAuditController(controllers);
                expect(session.map(record => record.kind)).toEqual(["form-opened", "form-closed", "form-started"]);
                expect(session.at(-1)).toMatchObject({ kind: "form-started", reason: "new" });
            });

            it("names the template it was started from", async () => {
                const { controllers, loaded, service } = await open("speeding");

                service.openForm(controllers, loaded);

                expect(getAuditController(controllers).session.at(-1)).toMatchObject({ kind: "form-started", template: "speeding" });
            });

            it("brings the history the host held for the report with it, in place of the last report's", async () => {
                const { controllers, loaded, service } = await open();
                getAuditController(controllers).load([{ ...held, id: "last-report" }]);
                getReviewController(controllers).load([{ ...comment, id: "last-report" }]);

                service.openForm(controllers, loaded);

                expect(getReviewController(controllers).comments).toEqual([comment]);
                expect(ids(controllers)).toContain("old-1");
                expect(ids(controllers)).not.toContain("last-report");
            });
        });

        describe("restoreHistory", () => {
            it("puts the audit history and the comments the host held into the controllers", async () => {
                const { controllers, loaded, service } = await open();

                service.restoreHistory(controllers, loaded);

                expect(ids(controllers)).toContain("old-1");
                expect(getReviewController(controllers).comments).toEqual([comment]);
            });

            it("replaces what was held for the last report", async () => {
                const { controllers, loaded, service } = await open();
                getAuditController(controllers).load([{ ...held, id: "last-report" }]);
                getReviewController(controllers).load([{ ...comment, id: "last-report" }]);

                service.restoreHistory(controllers, loaded);

                expect(ids(controllers)).not.toContain("last-report");
                expect(getReviewController(controllers).comments).toEqual([comment]);
            });

            it("leaves the report with no history and no comments when the host held none", async () => {
                const { controllers, loaded, service } = await open();
                getAuditController(controllers).load([held]);
                getReviewController(controllers).load([comment]);
                expect(ids(controllers)).toContain("old-1");

                service.restoreHistory(controllers, { ...loaded, audit: undefined, comments: undefined });

                expect(ids(controllers)).not.toContain("old-1");
                expect(getReviewController(controllers).comments).toEqual([]);
            });

            it("does not touch the form the controllers hold, or say anything of how it arrived", async () => {
                const { controllers, loaded, service } = await open();
                const before = controllers.getFormController().form;

                service.restoreHistory(controllers, loaded);

                expect(controllers.getFormController().form).toBe(before);
                expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened"]);
            });
        });
    });

    describe("keeping a report", () => {
        const officer: IActor = { id: "officer-1", name: "Officer One" };
        const comment: IReviewComment = { at: 1, author: { id: "reviewer-1", name: "Reviewer One" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };
        const held: AuditRecord = { at: 1, form: { id: "form-1", name: "Stub", revision: 0, version: "1.0" }, id: "old-1", kind: "saved" };
        const noIssues = new RuleIssueCollection();
        let name: string;

        beforeEach(() => {
            // what the form extracts moves with `name`, so a test makes the form dirty by changing it
            name = "Stub";
            WorkflowStubForm.mapper = { extract: () => record(name), populate: async form => form };
            vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
        });

        afterEach(() => {
            WorkflowStubForm.mapper = undefined;
            vi.restoreAllMocks();
        });

        /** A report held by real controllers, with the real audit and review watching it, clean as it opens. */
        async function open(configure: (form: FormModel<any>) => FormModel<any> = form => form) {
            const controllers = new ControllerManager();
            controllers.loadForm(configure(await new WorkflowStubForm().initialize()).clean());

            return {
                controllers,
                form: (): FormModel<any> => controllers.getFormController().form,
                kinds: (): Array<string> => getAuditController(controllers).session.map(entry => entry.kind),
                records: () => getAuditController(controllers).session
            };
        }

        const inReview = (form: FormModel<any>): FormModel<any> => form.setStatus("inReview").setMode("reviewable");
        const rejected = (form: FormModel<any>): FormModel<any> => form.setStatus("rejected");

        /** A host that keeps what it is given, and the spy that says what it was given. */
        function host(write: (data: IReportData) => Promise<void> = async () => undefined) {
            const spy = vi.fn(write);
            const manager: IReportViewerDataManager<any> = { read: async () => undefined, write: spy };

            return { manager, write: spy };
        }

        describe("save", () => {
            it("writes the report a revision on", async () => {
                const { controllers } = await open();
                const { manager, write } = host();

                await createService(catalogItem).save(controllers, manager);

                expect(write).toHaveBeenCalledTimes(1);
                expect(write).toHaveBeenCalledWith(expect.objectContaining({ revision: 1 }));
            });

            it("gives a host that takes the whole bundle the history with the data, and only the bundle", async () => {
                const { controllers } = await open();
                getAuditController(controllers).load([held]);
                getReviewController(controllers).load([comment]);
                const write = vi.fn(async () => undefined);
                const writeBundle = vi.fn(async () => undefined);

                await createService(catalogItem).save(controllers, { read: async () => undefined, write, writeBundle });

                expect(writeBundle).toHaveBeenCalledTimes(1);
                expect(writeBundle).toHaveBeenCalledWith(expect.objectContaining({ audit: expect.arrayContaining([held]), comments: [comment], data: expect.objectContaining({ revision: 1 }), version: 1 }));
                expect(write).not.toHaveBeenCalled();
            });

            it("rejects with the host's reason, and records the failure, when a bundle write fails", async () => {
                const { controllers, kinds } = await open();
                const writeBundle = vi.fn(async () => { throw new Error("The server is down."); });

                await expect(createService(catalogItem).save(controllers, { read: async () => undefined, writeBundle })).rejects.toThrow("The server is down.");

                expect(kinds()).toEqual(["form-opened", "save-failed"]);
            });

            it("puts the saved form in the controllers, a revision on and clean", async () => {
                const { controllers, form } = await open();
                name = "Typed";
                expect(form().getIsDirty()).toBe(true);

                await createService(catalogItem).save(controllers, host().manager);

                expect(form().revision).toBe(1);
                expect(form().getIsDirty()).toBe(false);
            });

            it("records that it saved, under the revision it saved, not the one before", async () => {
                const { controllers, kinds, records } = await open();

                await createService(catalogItem).save(controllers, host().manager);

                expect(kinds()).toEqual(["form-opened", "saved"]);
                expect(records().at(-1)).toMatchObject({ kind: "saved", form: { revision: 1 } });
            });

            it("keeps what was typed while the write was under way, at the revision that was written", async () => {
                const { controllers, form } = await open();
                let finish!: () => void;
                const { manager } = host(() => new Promise<void>(resolve => { finish = resolve; }));

                const pending = createService(catalogItem).save(controllers, manager);
                controllers.getFormController().update({ update: live => live.setStatus("inProgress") });
                finish();
                await pending;

                expect(form().status).toBe("inProgress");
                expect(form().revision).toBe(1);
            });

            it("rejects with the host's reason, leaving the report as it was and recording only the failure", async () => {
                const { controllers, form, kinds } = await open();
                const before = form();
                const { manager } = host(async () => { throw new Error("The server is down."); });

                await expect(createService(catalogItem).save(controllers, manager)).rejects.toThrow("The server is down.");

                expect(form()).toBe(before);
                expect(kinds()).toEqual(["form-opened", "save-failed"]);
            });

            it("rejects with a reason of its own when the host gives none", async () => {
                const { controllers, kinds } = await open();
                const { manager } = host(() => Promise.reject("offline"));

                await expect(createService(catalogItem).save(controllers, manager)).rejects.toThrow("The report could not be saved.");

                expect(kinds()).toEqual(["form-opened", "save-failed"]);
            });

            it("rejects, and writes and records nothing, when the host cannot write", async () => {
                const { controllers, form, kinds } = await open();
                const before = form();
                const service = createService(catalogItem);

                await expect(service.save(controllers, { read: async () => undefined })).rejects.toThrow("The host cannot keep reports.");
                await expect(service.save(controllers)).rejects.toThrow("The host cannot keep reports.");

                expect(form()).toBe(before);
                expect(kinds()).toEqual(["form-opened"]);
            });
        });

        describe("transition", () => {
            it("saves the report as the transition leaves it, and puts it in the controllers", async () => {
                const { controllers, form } = await open();
                const { manager, write } = host();

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues, manager);

                expect(write).toHaveBeenCalledTimes(1);
                expect(write).toHaveBeenCalledWith(expect.objectContaining({ revision: 1, status: "inReview" }));
                expect(form().status).toBe("inReview");
                expect(form().revision).toBe(1);
            });

            it("gives a host that takes the whole bundle the report as the transition leaves it as its data", async () => {
                const { controllers } = await open();
                const writeBundle = vi.fn(async () => undefined);

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues, { read: async () => undefined, writeBundle });

                expect(writeBundle).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ revision: 1, status: "inReview" }) }));
            });

            it("keeps who made it, and when, in the history", async () => {
                const { controllers, form } = await open();

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues, host().manager);

                expect(form().history).toEqual([{ at: 1_700_000_000_000, by: officer, from: "draft", to: "inReview", transition: "submit" }]);
            });

            it("leaves the form clean, since what it holds is what was saved", async () => {
                const { controllers, form } = await open();
                name = "Typed";
                expect(form().getIsDirty()).toBe(true);

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues, host().manager);

                expect(form().getIsDirty()).toBe(false);
            });

            it("records the transition, and then the save that kept it, under the revision it saved", async () => {
                const { controllers, kinds, records } = await open();

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues, host().manager);

                expect(kinds()).toEqual(["form-opened", "workflow-transition", "saved"]);
                expect(records().at(-1)).toMatchObject({ kind: "saved", form: { revision: 1 } });
            });

            it("counts the comments the review holds, for a transition that needs one open", async () => {
                const { controllers, form } = await open(inReview);
                getReviewController(controllers).load([comment]);

                await createService(catalogItem).transition(controllers, "reject", officer, noIssues, host().manager);

                expect(form().status).toBe("rejected");
            });

            it("rejects, and saves and records nothing, when it needs a comment open and none is", async () => {
                const { controllers, form, kinds } = await open(inReview);
                const { manager, write } = host();

                await expect(createService(catalogItem).transition(controllers, "reject", officer, noIssues, manager)).rejects.toThrow('"reject" needs at least one open comment.');

                expect(write).not.toHaveBeenCalled();
                expect(form().status).toBe("inReview");
                expect(kinds()).toEqual(["form-opened"]);
            });

            it("rejects a resubmission while a comment is open, and allows it once it is resolved", async () => {
                const { controllers, form } = await open(rejected);
                const { manager, write } = host();
                const service = createService(catalogItem);
                getReviewController(controllers).load([comment]);

                await expect(service.transition(controllers, "submit", officer, noIssues, manager)).rejects.toThrow('"submit" cannot be made while a comment is open.');
                expect(write).not.toHaveBeenCalled();
                expect(form().status).toBe("rejected");

                getReviewController(controllers).load([{ ...comment, isResolved: true }]);
                await service.transition(controllers, "submit", officer, noIssues, manager);

                expect(form().status).toBe("inReview");
            });

            it("rejects, and saves nothing, while what validation found holds an error", async () => {
                const { controllers, form } = await open();
                const { manager, write } = host();
                const issues = new RuleIssueCollection([{ field: { name: "firstName" }, message: "Bad.", section: {}, severity: RuleIssueSeverity.error } as IRuleIssue]);

                await expect(createService(catalogItem).transition(controllers, "submit", officer, issues, manager)).rejects.toThrow('"submit" cannot be made while the form has validation errors.');

                expect(write).not.toHaveBeenCalled();
                expect(form().status).toBe("draft");
            });

            it("rejects with the host's reason, leaving the report as it was and recording only the failure, when the save fails", async () => {
                const { controllers, form, kinds } = await open();
                const before = form();
                const { manager } = host(async () => { throw new Error("The server is down."); });

                await expect(createService(catalogItem).transition(controllers, "submit", officer, noIssues, manager)).rejects.toThrow("The server is down.");

                expect(form()).toBe(before);
                expect(form().history).toEqual([]);
                expect(kinds()).toEqual(["form-opened", "save-failed"]);
            });

            it("applies it in memory, without writing or recording a save, when there is no host to write to", async () => {
                const { controllers, form, kinds } = await open();

                await createService(catalogItem).transition(controllers, "submit", officer, noIssues);

                expect(form().status).toBe("inReview");
                expect(form().revision ?? 0).toBe(0);
                expect(kinds()).toEqual(["form-opened", "workflow-transition"]);
            });
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
