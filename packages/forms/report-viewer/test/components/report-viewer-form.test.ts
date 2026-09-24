import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { AuditService, IAuditService, getAuditController } from "@forms/audit";
import type { AuditRecord } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { IActor, FormMode, FormModel } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { IWorkflowService, WorkflowService } from "@forms/workflow";
import type { IServiceCollection } from "@shrub/core";

import { ReportViewerForm } from "../../src/components/report-viewer-form";
import type { IReportViewerComponent } from "../../src/components/report-viewer-form";
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
function stubForm(mode: FormMode = "editable"): FormModel<any> {
    const form = {
        id: "form-1",
        mode,
        name: "Stub Form",
        status: "draft",
        version: "1.0",
        mapper: undefined,
        extractData: () => ({ name: "Stub Form", status: "draft", type: "none", version: "1.0" }),
        getFieldPlacements: () => new Map(),
        getPages: () => [],
        getPagesFor: () => [],
        setMode: (next: FormMode) => ({ ...form, mode: next })
    };

    return form as unknown as FormModel<any>;
}

interface IMountOptions {
    readonly audit?: ReadonlyArray<AuditRecord>;
    readonly comments?: ReadonlyArray<IReviewComment>;
    readonly dataManager?: Partial<IReportViewerDataManager<any>>;
    readonly mode?: FormMode;
    /** An option to register, which is rendered when the options bar is shown. */
    readonly option?: IReportViewerOption;
    readonly showOptions?: boolean;
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
        [IModalService, new ModalService()],
        [INotificationService, new NotificationService()],
        [IReportViewerService, reportViewerService],
        [IReviewService, new ReviewService()],
        [IValidationService, new ValidationService()],
        [IWorkflowService, new WorkflowService()]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as unknown as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const ref = createRef<IReportViewerComponent>();

    const initialForm = (audit = options.audit, comments = options.comments): IInitialForm => ({
        audit,
        catalogItem: { name: "Stub Form", version: "1.0" } as never,
        comments,
        form: stubForm(),
        Component: () => createElement("div", { id: "stub-form" })
    });

    const render = (form: IInitialForm): void => {
        act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ReportViewerForm, {
            ref,
            controllers,
            dataManager: options.dataManager as IReportViewerDataManager<any>,
            initialForm: form,
            mode,
            showOptions: options.showOptions,
            user: options.user
        }))));
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
});

describe("ReportViewerForm", () => {
    it("renders the form it was given", () => {
        expect(mount().container.querySelector("#stub-form")).not.toBeNull();
    });

    describe("what the host held", () => {
        it("loads the audit history and the comments onto the controllers, the history ahead of what is raised now", () => {
            const { audit, review } = mount({ audit: [loadedRecord], comments: [heldComment] });

            expect(audit.history[0]).toBe(loadedRecord);
            expect(audit.history.map(record => record.kind)).toEqual(["saved", "form-opened"]);
            expect(review.comments).toEqual([heldComment]);
        });

        it("loads what a different form brings when it is handed one", () => {
            const { audit, initialForm, render, review } = mount({ audit: [loadedRecord], comments: [heldComment] });

            render(initialForm([], []));

            expect(audit.history.map(record => record.kind)).toEqual(["form-opened"]);
            expect(review.comments).toEqual([]);
        });

        it("does not write back the comments or the history it loaded", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const writeComments = vi.fn(async () => undefined);

            mount({ audit: [loadedRecord], comments: [heldComment], dataManager: { writeAudit, writeComments }, mode: "reviewable", user: rivera });
            await settle();

            expect(writeComments).not.toHaveBeenCalled();
            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.id))).not.toContain("loaded-1");
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

            expect(audit.session[0]).toMatchObject({ kind: "form-opened", by: rivera });
        });

        it("attributes the comments a reviewer makes to the whole of them", () => {
            const { review } = mount({ mode: "reviewable", user: rivera });

            expect(review.add({ level: "form" }, "Wrong date.").author).toEqual(rivera);
        });

        it("lets a reviewer comment once there is a user, and not before", () => {
            expect(mount({ mode: "reviewable", user: rivera }).review.canComment).toBe(true);
            expect(mount({ mode: "reviewable" }).review.canComment).toBe(false);
        });
    });

    describe("saving what is raised", () => {
        it("hands the audit records to the data manager as they are raised", async () => {
            const writeAudit = vi.fn(async (_records: ReadonlyArray<AuditRecord>) => undefined);
            const { audit } = mount({ dataManager: { writeAudit } });

            await act(async () => { audit.recordSaved(); });

            expect(writeAudit.mock.calls.flatMap(call => (call[0] as ReadonlyArray<AuditRecord>).map(record => record.kind))).toEqual(["form-opened", "saved"]);
        });

        it("hands the comments to the data manager as they change", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { writeComments }, mode: "reviewable", user: rivera });

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
