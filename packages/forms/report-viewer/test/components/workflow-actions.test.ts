import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { getAuditController } from "@forms/audit";
import { ControllerManager, defineWorkflow, FormDefinition, FormModel, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { IActor, IReportData, IRuleIssue } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { IWorkflowService, WorkflowService } from "@forms/workflow";
import type { IServiceCollection } from "@shrub/core";

import { WorkflowActions } from "../../src/components/workflow/workflow-actions";
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
            approve: { from: ["inReview"], guards: ["noOpenComments"], icon: "check2-circle", mode: "reviewable", title: "Approve", to: "approved" },
            reject: { from: ["inReview"], guards: ["hasOpenComments"], icon: "x-circle", mode: "reviewable", title: "Reject", to: "rejected" },
            submit: { from: ["draft", "rejected"], guards: ["noOpenComments"], icon: "send", mode: "editable", title: "Submit for review", to: "inReview" }
        },
        version: "1"
    });
}

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
new FormDefinition("workflow-stub-form", WorkflowStubForm, {});

const comment: IReviewComment = { at: 1, author: { id: "reviewer-1", name: "Reviewer One" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };

function issueOf(severity: RuleIssueSeverity): RuleIssueCollection {
    return new RuleIssueCollection([{ field: { name: "firstName" }, message: "Bad.", section: {}, severity } as IRuleIssue]);
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
        [IValidationService, { validate }],
        [IWorkflowService, new WorkflowService()]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(WorkflowActions, { controllers, dataManager: {} as never, user: user ?? undefined }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return {
        button: (id: string) => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`),
        buttonIds: () => Array.from(container.querySelectorAll("button[id^='workflow-']")).map(button => button.id),
        click: (id: string) => act(() => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`)!.click()),
        confirm: async () => act(async () => showConfirmModal.mock.calls[0][0].onConfirm()),
        controllers,
        form: () => controllers.getFormController().form,
        header: () => container.querySelector(".f-form-header"),
        save: () => container.querySelector<HTMLButtonElement>("#save-button"),
        saveForm,
        showConfirmModal,
        showNotification,
        subtitle: () => container.querySelector(".f-form-header__subtitle")?.textContent,
        tooltip: (id: string) => container.querySelector<HTMLElement>(`#workflow-${id}-button`)!.closest("[data-bs-toggle=tooltip]")?.getAttribute("data-bs-original-title") ?? undefined,
        validate
    };
}

/** A form as a reviewer finds it: submitted, and open to review. */
async function inReview(): Promise<FormModel<any>> {
    return (await new WorkflowStubForm().initialize()).setStatus("inReview").setMode("reviewable");
}

/** A form as the officer finds it after rejection: editable again, with the report still marked rejected. */
async function rejected(): Promise<FormModel<any>> {
    return (await new WorkflowStubForm().initialize()).setStatus("rejected").setMode("editable");
}

/** The same form, with no workflow -- as a form family that never declared one would be. */
function withoutWorkflow(form: FormModel<any>): FormModel<any> {
    return Object.assign(Object.create(Object.getPrototypeOf(form)), form, { workflow: undefined });
}

beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
});

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    vi.restoreAllMocks();
});

describe("WorkflowActions", () => {
    describe("the header", () => {
        it("is not rendered for a form that has no workflow and cannot be saved", async () => {
            const form = withoutWorkflow(await new WorkflowStubForm().initialize());

            expect((await mount({ canSave: false, form })).header()).toBeNull();
        });

        it("is rendered for a saveable form even without a workflow", async () => {
            const form = withoutWorkflow(await new WorkflowStubForm().initialize());

            expect((await mount({ form })).header()).not.toBeNull();
        });

        it("shows the form's status in words", async () => {
            expect((await mount()).subtitle()).toBe("draft");
            expect((await mount({ form: await inReview() })).subtitle()).toBe("in review");
        });

        it("follows the form as it moves, without being remounted", async () => {
            const { controllers, subtitle } = await mount();

            act(() => controllers.getFormController().update({ update: form => form.setStatus("inReview") }));

            expect(subtitle()).toBe("in review");
        });
    });

    describe("the buttons", () => {
        it("has one for each transition the form can make now", async () => {
            expect((await mount()).buttonIds()).toEqual(["workflow-submit-button"]);
            expect((await mount({ form: await inReview(), user: officer })).buttonIds()).toEqual(["workflow-approve-button", "workflow-reject-button"]);
        });

        it("has none when the form can make none, as a form that is only being viewed cannot", async () => {
            const form = (await new WorkflowStubForm().initialize()).setMode("viewable");

            expect((await mount({ form })).buttonIds()).toEqual([]);
        });

        it("follows the form as it moves, without being remounted", async () => {
            const { buttonIds, controllers } = await mount();

            act(() => controllers.getFormController().update({ update: form => form.setStatus("inReview").setMode("reviewable") }));

            expect(buttonIds()).toEqual(["workflow-approve-button", "workflow-reject-button"]);
        });
    });

    describe("the save button", () => {
        it("is shown for a form that can be saved", async () => {
            expect((await mount()).save()).not.toBeNull();
        });

        it("is not shown for a form that cannot be saved", async () => {
            expect((await mount({ canSave: false })).save()).toBeNull();
        });

        it("saves the form and tells the user", async () => {
            const { save, saveForm, showNotification } = await mount();

            await act(async () => save()!.click());

            expect(saveForm).toHaveBeenCalledTimes(1);
            expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Report saved." });
        });

        it("records it in the audit history", async () => {
            const { controllers, save } = await mount();

            await act(async () => save()!.click());

            expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "saved"]);
        });

        it("records it under the revision it saved, not the one before", async () => {
            const { controllers, save } = await mount();

            await act(async () => save()!.click());

            expect(getAuditController(controllers).session.at(-1)).toMatchObject({ kind: "saved", form: { revision: 1 } });
        });

        it("keeps what was typed while the save was under way, at the revision that was saved", async () => {
            const { controllers, form, save, saveForm } = await mount();
            let finish!: () => void;
            saveForm.mockImplementationOnce(() => new Promise<IReportData>(resolve => { finish = () => resolve({} as IReportData); }));

            await act(async () => { save()!.click(); });
            act(() => controllers.getFormController().update({ update: live => live.setStatus("inProgress") }));
            await act(async () => { finish(); });

            expect(form().status).toBe("inProgress");
            expect(form().revision).toBe(1);
        });

        it("says why, and records the failure, when it fails", async () => {
            const { controllers, save, saveForm, showNotification } = await mount();
            saveForm.mockRejectedValueOnce(new Error("The server is down."));

            await act(async () => save()!.click());

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The server is down." });
            expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "save-failed"]);
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

    describe("approving", () => {
        it("is disabled while a comment is open, and enabled once it is resolved, without being remounted", async () => {
            const { button, controllers, tooltip } = await mount({ form: await inReview() });

            act(() => getReviewController(controllers).load([comment]));

            expect(button("approve")!.disabled).toBe(true);
            expect(tooltip("approve")).toBe("Resolve every open comment first.");

            act(() => getReviewController(controllers).load([{ ...comment, isResolved: true }]));

            expect(button("approve")!.disabled).toBe(false);
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

            it("records the save that kept it under the revision it saved", async () => {
                const { click, confirm, controllers } = await mount();
                click("submit");

                await confirm();

                expect(getAuditController(controllers).session.at(-1)).toMatchObject({ kind: "saved", form: { revision: 1 } });
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

            it("says why, and saves nothing, when a comment is still open", async () => {
                // the button is only disabled by a comment that is already open, so it is clicked before one appears
                const { click, confirm, controllers, form, saveForm, showNotification } = await mount({ form: await rejected() });
                click("submit");

                // a comment appeared while the modal was open
                act(() => getReviewController(controllers).load([comment]));
                await confirm();

                expect(saveForm).not.toHaveBeenCalled();
                expect(form().status).toBe("rejected");
                expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: '"submit" cannot be made while a comment is open.' });
            });

            it("succeeds once the open comment is resolved", async () => {
                const { click, confirm, controllers, form, saveForm } = await mount({ form: await rejected() });
                act(() => getReviewController(controllers).load([{ ...comment, isResolved: true }]));
                click("submit");

                await confirm();

                expect(saveForm).toHaveBeenCalled();
                expect(form().status).toBe("inReview");
            });
        });
    });
});
