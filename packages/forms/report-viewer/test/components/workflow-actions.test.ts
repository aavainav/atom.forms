import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager, FormModel, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { IActor, IRuleIssue } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import { IWorkflowService, WorkflowService } from "@forms/workflow";
import type { IServiceCollection } from "@shrub/core";

import { WorkflowActions } from "../../src/components/workflow/workflow-actions";
import { IModalService } from "../../src/services/modal";
import type { IConfirmOptions } from "../../src/services/modal";
import { INotificationService } from "../../src/services/notification";
import { IReportViewerService } from "../../src/services/report-viewer";
import type { IReportViewerDataManager } from "../../src/services/report-viewer";
import { IValidationService } from "../../src/services/validation";
import { WorkflowStubForm } from "../fixtures/workflow-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const officer: IActor = { id: "officer-1", name: "Officer One" };

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

    const dataManager: IReportViewerDataManager<any> = { read: async () => undefined };
    const showConfirmModal = vi.fn((_: IConfirmOptions) => undefined);
    const showNotification = vi.fn();
    // the service keeps and moves the report; what is asked of it, and what it answers, is all the component sees
    const save = vi.fn(async (..._: Array<unknown>) => undefined);
    const transition = vi.fn(async (..._: Array<unknown>) => undefined);
    const validate = vi.fn((_: unknown) => issues);
    const registry = new Map<unknown, unknown>([
        [IModalService, { showConfirmModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { canSaveForm: () => canSave, save, transition }],
        [IValidationService, { validate }],
        [IWorkflowService, new WorkflowService()]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(WorkflowActions, { controllers, dataManager, user: user ?? undefined }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return {
        button: (id: string) => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`),
        buttonIds: () => Array.from(container.querySelectorAll("button[id^='workflow-']")).map(button => button.id),
        click: (id: string) => act(() => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`)!.click()),
        confirm: async () => act(async () => showConfirmModal.mock.calls[0][0].onConfirm()),
        controllers,
        dataManager,
        header: () => container.querySelector(".f-form-header"),
        issues,
        save,
        saveButton: () => container.querySelector<HTMLButtonElement>("#save-button"),
        showConfirmModal,
        showNotification,
        subtitle: () => container.querySelector(".f-form-header__subtitle")?.textContent,
        tooltip: (id: string) => container.querySelector<HTMLElement>(`#workflow-${id}-button`)!.closest("[data-bs-toggle=tooltip]")?.getAttribute("data-bs-original-title") ?? undefined,
        transition,
        validate
    };
}

/** A form as a reviewer finds it: submitted, and open to review. */
async function inReview(): Promise<FormModel<any>> {
    return (await new WorkflowStubForm().initialize()).setStatus("inReview").setMode("reviewable");
}

/** The same form, with no workflow -- as a form family that never declared one would be. */
function withoutWorkflow(form: FormModel<any>): FormModel<any> {
    return Object.assign(Object.create(Object.getPrototypeOf(form)), form, { workflow: undefined });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
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
            expect((await mount()).saveButton()).not.toBeNull();
        });

        it("is not shown for a form that cannot be saved", async () => {
            expect((await mount({ canSave: false })).saveButton()).toBeNull();
        });

        it("has the report saved through the service, with its controllers and the data manager, and tells the user", async () => {
            const { controllers, dataManager, save, saveButton, showNotification } = await mount();

            await act(async () => saveButton()!.click());

            expect(save).toHaveBeenCalledTimes(1);
            expect(save).toHaveBeenCalledWith(controllers, dataManager);
            expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Report saved." });
        });

        it("says why, and does not say it saved, when it fails", async () => {
            const { save, saveButton, showNotification } = await mount();
            save.mockRejectedValueOnce(new Error("The server is down."));

            await act(async () => saveButton()!.click());

            expect(showNotification).toHaveBeenCalledTimes(1);
            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The server is down." });
        });

        it("says the report could not be saved when it fails without a reason", async () => {
            const { save, saveButton, showNotification } = await mount();
            save.mockRejectedValueOnce("offline");

            await act(async () => saveButton()!.click());

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The report could not be saved." });
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

        it("makes no transition until it is confirmed", async () => {
            const { click, transition } = await mount();

            click("submit");

            expect(transition).not.toHaveBeenCalled();
        });

        it("makes no transition when the user cancels", async () => {
            const { click, showConfirmModal, transition } = await mount();

            click("submit");
            await act(async () => showConfirmModal.mock.calls[0][0].onCancel());

            expect(transition).not.toHaveBeenCalled();
        });

        describe("once confirmed", () => {
            it("has the service make it, with the report's controllers, who is making it, what validation found and the data manager", async () => {
                const { click, confirm, controllers, dataManager, issues, transition } = await mount();
                click("submit");

                await confirm();

                expect(transition).toHaveBeenCalledTimes(1);
                expect(transition).toHaveBeenCalledWith(controllers, "submit", officer, issues, dataManager);
            });

            it("tells the user it is done", async () => {
                const { click, confirm, showNotification } = await mount();
                click("submit");

                await confirm();

                expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Submit for review complete." });
            });

            it("says why, and does not say it is done, when the service refuses it", async () => {
                const { click, confirm, showNotification, transition } = await mount({ form: await inReview() });
                transition.mockRejectedValueOnce(new Error('"approve" cannot be made while a comment is open.'));
                click("approve");

                await confirm();

                expect(showNotification).toHaveBeenCalledTimes(1);
                expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: '"approve" cannot be made while a comment is open.' });
            });

            it("says it could not be made when the service fails without a reason", async () => {
                const { click, confirm, showNotification, transition } = await mount();
                transition.mockRejectedValueOnce("offline");
                click("submit");

                await confirm();

                expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "Submit for review could not be made." });
            });
        });
    });
});
