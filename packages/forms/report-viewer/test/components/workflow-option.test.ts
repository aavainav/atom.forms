import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { getAuditController } from "@forms/audit";
import { ControllerManager, defineWorkflow, FormDefinition, FormModel, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { IActor, IReportData, IRuleIssue } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import type { IServiceCollection } from "@shrub/core";

import { WorkflowOption } from "../../src/components/options/workflow-option";
import { IModalService } from "../../src/services/modal";
import type { IConfirmOptions } from "../../src/services/modal";
import { INotificationService } from "../../src/services/notification";
import { IReportViewerService } from "../../src/services/report-viewer";
import { IValidationService } from "../../src/services/validation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const officer: IActor = { id: "officer-1", name: "Officer One" };

/** A form with no pages and a small workflow: submit it, then approve it or reject it with a comment. */
class WorkflowStubForm extends FormModel<any> {
    public readonly workflow = defineWorkflow({
        id: "stub-workflow",
        transitions: {
            approve: { from: ["inReview"], mode: "reviewable", title: "Approve", to: "approved" },
            reject: { from: ["inReview"], guards: ["hasOpenComments"], mode: "reviewable", title: "Reject", to: "rejected" },
            submit: { from: ["draft"], mode: "editable", title: "Submit for review", to: "inReview" }
        },
        version: "1"
    });
}

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
new FormDefinition("workflow-stub-form", WorkflowStubForm, {});

const comment: IReviewComment = { at: 1, author: { id: "reviewer-1", name: "Reviewer One" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };

function issueOf(severity: RuleIssueSeverity): RuleIssueCollection {
    return new RuleIssueCollection([{ field: { name: "firstName" }, message: "Bad.", section: {}, severity } as unknown as IRuleIssue]);
}

interface IMountOptions {
    readonly canSave?: boolean;
    readonly form?: FormModel<any>;
    readonly issues?: RuleIssueCollection;
    readonly user?: IActor | null;
}

const mounted: Array<() => void> = [];

async function mount(options: IMountOptions = {}) {
    const { canSave = true, issues = new RuleIssueCollection(), user = officer } = options;
    const controllers = new ControllerManager();
    controllers.loadForm(options.form ?? await new WorkflowStubForm().initialize());

    const showConfirmModal = vi.fn((_: IConfirmOptions) => undefined);
    const showNotification = vi.fn();
    const saveForm = vi.fn(async (..._: Array<unknown>) => ({}) as IReportData);
    const validate = vi.fn((_: unknown) => issues);
    const registry = new Map<unknown, unknown>([
        [IModalService, { showConfirmModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { canSaveForm: () => canSave, saveForm }],
        [IValidationService, { validate }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as unknown as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(WorkflowOption, { catalogItem: {} as never, controllers, dataManager: {} as never, onError: vi.fn(), showModal: vi.fn(), title: "Workflow", user: user ?? undefined }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return {
        button: (id: string) => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`),
        buttons: () => Array.from(container.querySelectorAll("button")).map(button => button.textContent),
        click: (id: string) => act(() => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`)!.click()),
        confirm: async () => act(async () => showConfirmModal.mock.calls[0][0].onConfirm()),
        controllers,
        form: () => controllers.getFormController().form,
        saveForm,
        showConfirmModal,
        showNotification,
        tooltip: (id: string) => container.querySelector<HTMLElement>(`#workflow-${id}-button`)!.closest("[data-bs-toggle=tooltip]")?.getAttribute("data-bs-original-title") ?? undefined,
        validate
    };
}

/** A form as a reviewer finds it: submitted, and open to review. */
async function inReview(): Promise<FormModel<any>> {
    return (await new WorkflowStubForm().initialize()).setStatus("inReview").setMode("reviewable");
}

beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
});

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    vi.restoreAllMocks();
});

describe("WorkflowOption", () => {
    describe("the buttons", () => {
        it("has one for each transition the form can make now, called by its title", async () => {
            expect((await mount()).buttons()).toEqual(["Submit for review"]);
            expect((await mount({ form: await inReview(), user: officer })).buttons()).toEqual(["Approve", "Reject"]);
        });

        it("has none when the form can make none, as a form that is only being viewed cannot", async () => {
            const form = (await new WorkflowStubForm().initialize()).setMode("viewable");

            expect((await mount({ form })).buttons()).toEqual([]);
        });

        it("has none for a form that has no workflow", async () => {
            const form = Object.assign(Object.create(Object.getPrototypeOf(await new WorkflowStubForm().initialize())), { workflow: undefined });

            expect((await mount({ form })).buttons()).toEqual([]);
        });

        it("follows the form as it moves, without being remounted", async () => {
            const { buttons, controllers } = await mount();

            act(() => controllers.getFormController().update(form => form.setStatus("inReview").setMode("reviewable")));

            expect(buttons()).toEqual(["Approve", "Reject"]);
        });
    });

    describe("without a user", () => {
        it("disables every button, and says why", async () => {
            const { button, tooltip } = await mount({ user: null });

            expect(button("submit")!.disabled).toBe(true);
            expect(tooltip("submit")).toBe("Say who is using the report before making this change.");
        });

        it("makes no transition when one is clicked", async () => {
            const { click, showConfirmModal, validate } = await mount({ user: null });

            click("submit");

            expect(validate).not.toHaveBeenCalled();
            expect(showConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe("a transition that needs an open comment", () => {
        it("is disabled until one is open, and says what to do", async () => {
            const { button, tooltip } = await mount({ form: await inReview() });

            expect(button("reject")!.disabled).toBe(true);
            expect(tooltip("reject")).toBe("Add a comment first, so the author knows what to fix.");
            expect(button("approve")!.disabled).toBe(false);
        });

        it("is enabled once a comment is open, without being remounted", async () => {
            const { button, controllers } = await mount({ form: await inReview() });

            act(() => getReviewController(controllers).load([comment]));

            expect(button("reject")!.disabled).toBe(false);
        });

        it("is disabled again when the comment is resolved", async () => {
            const { button, controllers } = await mount({ form: await inReview() });

            act(() => getReviewController(controllers).load([comment]));
            act(() => getReviewController(controllers).load([{ ...comment, isResolved: true }]));

            expect(button("reject")!.disabled).toBe(true);
        });
    });

    describe("making a transition", () => {
        it("validates the report first, and does not ask to confirm while it holds an error", async () => {
            const { click, controllers, showConfirmModal, showNotification, validate } = await mount({ issues: issueOf(RuleIssueSeverity.error) });

            click("submit");

            expect(validate).toHaveBeenCalledWith(controllers);
            expect(showConfirmModal).not.toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: '1 validation issue(s) must be fixed before "Submit for review".' });
        });

        it("asks to confirm once the report is valid, saying where the status is going", async () => {
            const { click, showConfirmModal } = await mount();

            click("submit");

            expect(showConfirmModal).toHaveBeenCalledTimes(1);
            expect(showConfirmModal.mock.calls[0][0]).toMatchObject({
                confirmText: "Submit for review",
                message: "The report will move from draft to in review. Continue?",
                title: "Submit for review"
            });
        });

        it("is not stopped by a warning", async () => {
            const { click, showConfirmModal } = await mount({ issues: issueOf(RuleIssueSeverity.warning) });

            click("submit");

            expect(showConfirmModal).toHaveBeenCalledTimes(1);
        });

        it("changes nothing until it is confirmed", async () => {
            const { click, form, saveForm } = await mount();

            click("submit");

            expect(form().status).toBe("draft");
            expect(saveForm).not.toHaveBeenCalled();
        });

        it("changes nothing when the user cancels", async () => {
            const { click, form, saveForm, showConfirmModal } = await mount();

            click("submit");
            await act(async () => showConfirmModal.mock.calls[0][0].onCancel());

            expect(form().status).toBe("draft");
            expect(saveForm).not.toHaveBeenCalled();
        });

        describe("once confirmed", () => {
            it("saves the report as the transition leaves it, and then applies it to the form", async () => {
                const { click, confirm, form, saveForm } = await mount();
                click("submit");

                await confirm();

                const saved = saveForm.mock.calls[0][0] as FormModel<any>;
                expect(saved.status).toBe("inReview");
                expect(form().status).toBe("inReview");
            });

            it("keeps who made it, and when, in the history", async () => {
                const { click, confirm, form } = await mount();
                click("submit");

                await confirm();

                expect(form().history).toEqual([{ at: 1_700_000_000_000, by: officer, from: "draft", to: "inReview", transition: "submit" }]);
            });

            it("counts the comments that are open for a transition that needs one", async () => {
                const { click, confirm, controllers, form } = await mount({ form: await inReview() });
                act(() => getReviewController(controllers).load([comment]));
                click("reject");

                await confirm();

                expect(form().status).toBe("rejected");
            });

            it("tells the user it is done", async () => {
                const { click, confirm, showNotification } = await mount();
                click("submit");

                await confirm();

                expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Submit for review complete." });
            });

            it("leaves the form clean, since what it holds is what was saved", async () => {
                const { click, confirm, form } = await mount();
                click("submit");

                await confirm();

                expect(form().getIsDirty()).toBe(false);
            });

            it("records the transition in the audit history, and then the save that kept it", async () => {
                const { click, confirm, controllers } = await mount();
                click("submit");

                await confirm();

                expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "workflow-transition", "saved"]);
            });

            it("leaves the form as it was, and says why, when the save fails", async () => {
                const { click, confirm, controllers, form, saveForm, showNotification } = await mount();
                saveForm.mockRejectedValueOnce(new Error("The server is down."));
                click("submit");

                await confirm();

                expect(form().status).toBe("draft");
                expect(form().history).toEqual([]);
                expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The server is down." });
                expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "save-failed"]);
            });

            it("applies it without saving when the host has nothing to save to, and records no save", async () => {
                const { click, confirm, controllers, form, saveForm } = await mount({ canSave: false });
                click("submit");

                await confirm();

                expect(saveForm).not.toHaveBeenCalled();
                expect(form().status).toBe("inReview");
                expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "workflow-transition"]);
            });

            it("says why, and saves nothing, when the model refuses it", async () => {
                const { click, confirm, controllers, form, saveForm, showNotification } = await mount({ form: await inReview() });
                act(() => getReviewController(controllers).load([comment]));
                click("reject");

                // the comment was resolved while the modal was open
                act(() => getReviewController(controllers).load([{ ...comment, isResolved: true }]));
                await confirm();

                expect(saveForm).not.toHaveBeenCalled();
                expect(form().status).toBe("inReview");
                expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: '"reject" needs at least one open comment.' });
            });
        });
    });
});
