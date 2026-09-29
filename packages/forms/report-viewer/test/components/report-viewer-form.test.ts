import { act, createElement, createRef, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { AuditService, IAuditService, getAuditController } from "@forms/audit";
import type { AuditRecord } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { IActor, FormMode, FormModel, FormStatus, IUserPreferences } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { IWorkflowService, WorkflowService } from "@forms/workflow";
import type { IServiceCollection } from "@shrub/core";

import { ReportViewerForm } from "../../src/components/report-viewer-form";
import type { IReportViewerComponent } from "../../src/components/report-viewer-form";
import { ILocalStorageService, LocalStorageService } from "../../src/services/local-storage";
import { IModalService, ModalService } from "../../src/services/modal";
import { INotificationService, NotificationService } from "../../src/services/notification";
import { IReportViewerService, ReportViewerService } from "../../src/services/report-viewer";
import type { IInitialForm, IReportViewerDataManager, IReportViewerOption, IReportViewerOptionProps } from "../../src/services/report-viewer";
import { IReviewService, ReviewService } from "../../src/services/review";
import { IValidationService, ValidationService } from "../../src/services/validation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const rivera: IActor = { agency: "Riverside Police Department", badgeId: "4471", id: "4471", name: "Sgt. Rivera", rank: "Sergeant" };
const loadedRecord: AuditRecord = { at: 1, form: { id: "form-0", name: "Stub Form", revision: 0, version: "1.0" }, id: "loaded-1", kind: "saved" };
const heldComment: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "held-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };

const mounted: Array<() => void> = [];

/** Stands in for a form: the viewer, the controllers and the audit read only its identity, its mode and what extracting it gives. */
function stubForm(mode: FormMode = "editable", status: FormStatus = "draft"): FormModel<any> {
    const form = {
        id: "form-1",
        mode,
        name: "Stub Form",
        status,
        version: "1.0",
        mapper: undefined,
        extractData: () => ({ name: "Stub Form", status, type: "none", version: "1.0" }),
        getFieldPlacements: () => new Map(),
        getIsDirty: () => false,
        getPages: () => [],
        getPagesFor: () => [],
        history: [],
        setMode: (next: FormMode) => ({ ...form, mode: next })
    };

    return form as unknown as FormModel<any>;
}

interface IMountOptions {
    readonly audit?: ReadonlyArray<AuditRecord>;
    readonly comments?: ReadonlyArray<IReviewComment>;
    readonly dataManager?: Partial<IReportViewerDataManager<any>>;
    /** Whether the host had a record to give, which has the form arrive as loaded rather than started. */
    readonly hasRecord?: boolean;
    /** Renders under `StrictMode`, which in development sets every effect up, cleans it up and sets it up again. */
    readonly isStrict?: boolean;
    readonly mode?: FormMode;
    /** An option to register, which is rendered when the options bar is shown. */
    readonly option?: IReportViewerOption;
    readonly preferences?: IUserPreferences;
    readonly showOptions?: boolean;
    /** Where the report stands, which is what a reviewer's comments depend on: draft when omitted. */
    readonly status?: FormStatus;
    readonly user?: IActor;
}

/** Mounts the real form component over a stub form, against real services. */
function mount(options: IMountOptions = {}) {
    const { mode = "editable" } = options;
    const controllers = new ControllerManager();
    const reportViewerService = new ReportViewerService({} as never, new WorkflowService());

    if (options.option) {
        reportViewerService.registerOption(options.option);
    }

    const registry = new Map<unknown, unknown>([
        [IAuditService, new AuditService()],
        [ILocalStorageService, new LocalStorageService()],
        [IModalService, new ModalService()],
        [INotificationService, new NotificationService()],
        [IReportViewerService, reportViewerService],
        [IReviewService, new ReviewService()],
        [IValidationService, new ValidationService()],
        [IWorkflowService, new WorkflowService()]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const ref = createRef<IReportViewerComponent>();

    const initialForm = (audit = options.audit, comments = options.comments): IInitialForm => ({
        audit,
        catalogItem: { name: "Stub Form", version: "1.0" } as never,
        comments,
        form: stubForm("editable", options.status),
        hasRecord: options.hasRecord ?? false,
        reason: "open",
        Component: () => createElement("div", { id: "stub-form" })
    });

    const render = (form: IInitialForm): void => {
        const tree = createElement(ServicesContext.Provider, { value: services }, createElement(ReportViewerForm, {
            ref,
            controllers,
            dataManager: options.dataManager as IReportViewerDataManager<any>,
            initialForm: form,
            mode,
            preferences: options.preferences,
            showOptions: options.showOptions,
            user: options.user
        }));

        // React only sets effects up twice for a StrictMode that is the outermost element
        act(() => root.render(options.isStrict ? createElement(StrictMode, undefined, tree) : tree));
    };

    render(initialForm());
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { audit: getAuditController(controllers), container, controllers, ref, render, review: getReviewController(controllers), initialForm };
}

/** Lets what the form's effects started run to completion. */
async function settle(): Promise<void> {
    await act(async () => { await Promise.resolve(); });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
    localStorage.clear();
});

describe("ReportViewerForm", () => {
    it("renders the form it was given", () => {
        expect(mount().container.querySelector("#stub-form")).not.toBeNull();
    });

    describe("what the host held", () => {
        it("loads the audit history and the comments onto the controllers, the history ahead of what is raised now", () => {
            const { audit, review } = mount({ audit: [loadedRecord], comments: [heldComment], hasRecord: true });

            expect(audit.history[0]).toBe(loadedRecord);
            expect(audit.history.map(record => record.kind)).toEqual(["saved", "form-loaded"]);
            expect(review.comments).toEqual([heldComment]);
        });

        it("says the form was loaded, with what came with the record", () => {
            const { audit } = mount({ audit: [loadedRecord], comments: [heldComment], hasRecord: true });

            expect(audit.session[0]).toMatchObject({ kind: "form-loaded", auditRecords: 1, comments: 1, transitions: 0 });
        });

        it("says the form was started when the host had no record", () => {
            const { audit } = mount();

            expect(audit.session[0]).toMatchObject({ kind: "form-started", reason: "open" });
        });

        it("loads what a different form brings when it is handed one", () => {
            const { audit, initialForm, render, review } = mount({ audit: [loadedRecord], comments: [heldComment], hasRecord: true });

            render(initialForm([], []));

            expect(audit.history.map(record => record.kind)).toEqual(["form-loaded"]);
            expect(review.comments).toEqual([]);
        });

        it("does not update what is already mounted while it renders, when it is handed a different form", () => {
            const { initialForm, render } = mount({ audit: [loadedRecord], comments: [heldComment] });
            const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

            try {
                render(initialForm([], []));

                expect(error.mock.calls.map(([message]) => String(message))).not.toContainEqual(expect.stringContaining("Cannot update a component"));
            }
            finally {
                error.mockRestore();
            }
        });

        it("does not write back the comments or the history it loaded", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const writeComments = vi.fn(async () => undefined);

            mount({ audit: [loadedRecord], comments: [heldComment], dataManager: { writeAudit, writeComments }, mode: "reviewable", status: "inReview", user: rivera });
            await settle();

            expect(writeComments).not.toHaveBeenCalled();
            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.id))).not.toContain("loaded-1");
        });

        it("hands the host the close when the viewer goes, which is raised as it goes", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            mount({ dataManager: { writeAudit } });
            await settle();

            mounted.splice(0).forEach(unmount => unmount());
            await Promise.resolve();

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "form-closed"]);
        });

        it("hands the host the close when the page is put away", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            mount({ dataManager: { writeAudit } });
            await settle();

            window.dispatchEvent(new Event("pagehide"));
            await settle();

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "form-closed"]);
        });

        it("hands the host the opening again when the browser restores the page from its cache, and what happens after", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const { audit } = mount({ dataManager: { writeAudit } });
            await settle();

            window.dispatchEvent(new Event("pagehide"));
            await settle();
            window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
            await settle();
            await act(async () => { audit.recordSaved(); });

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "form-closed", "form-restored", "saved"]);
        });

        /** The workbench renders under StrictMode, where the viewer is set up, cleaned up and set up again at once. */
        it("hands the host no close for the remount React's StrictMode does in development, and each record once", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const { audit } = mount({ dataManager: { writeAudit }, isStrict: true });
            await settle();

            await act(async () => { audit.recordSaved(); });

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "saved"]);
        });

        it("hands the host the close under StrictMode when the viewer really goes", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            mount({ dataManager: { writeAudit }, isStrict: true });
            await settle();

            mounted.splice(0).forEach(unmount => unmount());
            await Promise.resolve();

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "form-closed"]);
        });
    });

    describe("the options bar", () => {
        /** An option that shows the props it was rendered with. */
        function probe(seen: Array<IReportViewerOptionProps>): IReportViewerOption {
            return { Component: props => { seen.push(props); return createElement("span", { id: "probe" }); }, id: "probe", title: "Probe" };
        }

        it("hands the user to each option, for the ones that act in their name", () => {
            const seen: Array<IReportViewerOptionProps> = [];

            mount({ option: probe(seen), showOptions: true, user: rivera });

            expect(seen.at(-1)!.user).toEqual(rivera);
        });

        it("hands them no user when the host said none", () => {
            const seen: Array<IReportViewerOptionProps> = [];

            mount({ option: probe(seen), showOptions: true });

            expect(seen.at(-1)!.user).toBeUndefined();
        });

        it("is not rendered unless it is asked for", () => {
            expect(mount({ option: probe([]), user: rivera }).container.querySelector("#probe")).toBeNull();
        });
    });

    describe("the user", () => {
        it("attributes the records the form raises to them", () => {
            const { audit } = mount({ user: rivera });

            audit.recordSaved();

            expect(audit.session.at(-1)!.by).toEqual(rivera);
        });

        it("attributes the form being opened to them, since they are known before it loads", () => {
            const { audit } = mount({ user: rivera });

            expect(audit.session[0]).toMatchObject({ kind: "form-started", by: rivera });
        });

        it("attributes the comments a reviewer makes to the whole of them", () => {
            const { review } = mount({ mode: "reviewable", status: "inReview", user: rivera });
            let comment!: IReviewComment;

            // the layer draws the comments, so adding one updates it
            act(() => { comment = review.add({ level: "form" }, "Wrong date."); });

            expect(comment.author).toEqual(rivera);
        });

        it("lets a reviewer comment once there is a user, and not before", () => {
            expect(mount({ mode: "reviewable", status: "inReview", user: rivera }).review.canComment).toBe(true);
            expect(mount({ mode: "reviewable", status: "inReview" }).review.canComment).toBe(false);
        });

        it("lets a reviewer comment only while the report is in review", () => {
            expect(mount({ mode: "reviewable", status: "draft", user: rivera }).review.canComment).toBe(false);
            expect(mount({ mode: "reviewable", status: "rejected", user: rivera }).review.canComment).toBe(false);
        });
    });

    describe("preferences", () => {
        it("starts empty when nothing is stored and none is given", async () => {
            const { controllers } = mount({ user: rivera });
            await settle();

            expect(controllers.preferences).toEqual({ violationFavorites: {} });
        });

        it("loads what is stored for the user, keyed by their id", async () => {
            const stored: IUserPreferences = { violationFavorites: { "sc-s438:violation": ["56-05-2930(A)"] } };
            localStorage.setItem(`report-viewer:preferences:${rivera.id}`, JSON.stringify(stored));

            const { controllers } = mount({ user: rivera });
            await settle();

            expect(controllers.preferences).toEqual(stored);
        });

        it("keeps a given value as-is, without reading from storage", async () => {
            localStorage.setItem(`report-viewer:preferences:${rivera.id}`, JSON.stringify({ violationFavorites: { stored: ["X"] } }));
            const given: IUserPreferences = { violationFavorites: { given: ["Y"] } };

            const { controllers } = mount({ user: rivera, preferences: given });
            await settle();

            expect(controllers.preferences).toEqual(given);
        });

        it("persists a later change when none was given", async () => {
            const { controllers } = mount({ user: rivera });
            await settle();

            const updated: IUserPreferences = { violationFavorites: { "sc-s438:violation": ["56-05-1520(G)(4)"] } };
            act(() => controllers.setPreferences(updated));
            await settle();

            expect(JSON.parse(localStorage.getItem(`report-viewer:preferences:${rivera.id}`)!)).toEqual(updated);
        });

        it("does not persist a later change back to storage when one was given", async () => {
            const given: IUserPreferences = { violationFavorites: {} };
            const { controllers } = mount({ user: rivera, preferences: given });
            await settle();

            act(() => controllers.setPreferences({ violationFavorites: { "sc-s438:violation": ["56-05-1520(G)(4)"] } }));
            await settle();

            expect(localStorage.getItem(`report-viewer:preferences:${rivera.id}`)).toBeNull();
        });
    });

    describe("saving what is raised", () => {
        it("hands the audit records to the data manager as they are raised", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const { audit } = mount({ dataManager: { writeAudit } });

            await act(async () => { audit.recordSaved(); });

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-started", "saved"]);
        });

        it("hands the comments to the data manager as they change", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { writeComments }, mode: "reviewable", status: "inReview", user: rivera });

            await act(async () => { review.add({ level: "form" }, "Wrong date."); });

            expect(writeComments).toHaveBeenCalledWith(review.comments);
        });
    });

    describe("the review panel", () => {
        const panel = (container: HTMLElement): Element | null => container.querySelector("#review-comments__offcanvas");

        it("is mounted for a reviewable form", () => {
            expect(panel(mount({ mode: "reviewable" }).container)).not.toBeNull();
        });

        it("is mounted for an editable form only when the host can keep comments", () => {
            expect(panel(mount().container)).toBeNull();
            expect(panel(mount({ dataManager: { writeComments: async () => undefined } }).container)).not.toBeNull();
        });

        it("is never mounted for a viewable form", () => {
            expect(panel(mount({ dataManager: { writeComments: async () => undefined }, mode: "viewable" }).container)).toBeNull();
        });
    });

    describe("a new form swapped in after it was mounted", () => {
        /** A different form, as the New form option swaps one in: it has an id of its own. */
        const startedForm = (): FormModel<any> => Object.assign(stubForm(), { id: "form-2" });

        it("stays when the viewer renders again with the form it began with, as it does whenever its host does", () => {
            const { controllers, initialForm, render } = mount();
            const original = initialForm();
            const started = startedForm();
            render(original);

            act(() => controllers.getFormController().setForm(started));
            render(original);

            expect(controllers.getFormController().form).toBe(started);
        });

        it("stays when the viewer renders again with a different data manager, as a host that re-reads its url does", () => {
            const { controllers, initialForm, render } = mount({ dataManager: { read: async () => undefined } });
            const original = initialForm();
            const started = startedForm();
            render(original);

            act(() => controllers.getFormController().setForm(started));
            render(original);

            expect(controllers.getFormController().form.id).toBe("form-2");
        });

        it("is replaced when the viewer is handed a different form of its own, since that is a form the host asked for", () => {
            const { controllers, initialForm, render } = mount();
            render(initialForm());
            act(() => controllers.getFormController().setForm(startedForm()));
            const handed = { ...initialForm(), form: Object.assign(stubForm(), { id: "form-3" }) };

            render(handed);

            expect(controllers.getFormController().form).toBe(handed.form);
        });
    });

    describe("getBundle", () => {
        it("gathers the data, the audit history and the comments the form holds", () => {
            const { audit, ref, review } = mount({ audit: [loadedRecord], comments: [heldComment] });

            const bundle = ref.current!.getBundle();

            expect(bundle.version).toBe(1);
            expect(bundle.data).toEqual({ name: "Stub Form", status: "draft", type: "none", version: "1.0" });
            expect(bundle.audit).toBe(audit.history);
            expect(bundle.comments).toBe(review.comments);
        });
    });
});
