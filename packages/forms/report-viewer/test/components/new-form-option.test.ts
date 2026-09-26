import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { getAuditController } from "@forms/audit";
import type { AuditRecord } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import type { IServiceCollection } from "@shrub/core";

import { NewFormOption } from "../../src/components/options/new-form-option";
import { IModalService } from "../../src/services/modal";
import { INotificationService } from "../../src/services/notification";
import { IReportViewerService } from "../../src/services/report-viewer";
import type { IReportTemplate, IReportViewerDataManager } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function stubForm(id: string, isDirty: boolean, revision = 0): FormModel<any> {
    return {
        history: [], id, mode: "editable", name: "Stub Form", revision, status: "draft", version: "1.0",
        clean() { return this; }, getIsDirty: () => isDirty, incrementRevision() { return stubForm(id, isDirty, revision + 1); }
    } as unknown as FormModel<any>;
}

const previousAudit: AuditRecord = { at: 1, form: { id: "form-2", name: "Stub Form", revision: 0, version: "1.0" }, id: "old-1", kind: "saved" };
const previousComment: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "old-c", isResolved: false, target: { level: "form" }, text: "Left over." };

const speeding: IReportTemplate = { id: "speeding", title: "Speeding, 15 over" };
const standard: IReportTemplate = { id: "standard", isDefault: true, title: "Standard" };

interface IMountOptions {
    readonly canSave?: boolean;
    readonly isDirty?: boolean;
    /** What the host lists as its templates; a host that lists none has no `readTemplates` at all. */
    readonly readTemplates?: () => Promise<ReadonlyArray<IReportTemplate>>;
}

function mount(options: IMountOptions = {}) {
    const { canSave = false, isDirty = false, readTemplates } = options;
    const controllers = new ControllerManager();
    controllers.loadForm(stubForm("form-1", isDirty));

    const newForm = stubForm("form-2", false);
    const loadForm = vi.fn(async () => ({ audit: [previousAudit], comments: [previousComment], form: newForm }));
    const getArrival = vi.fn(() => ({ kind: "started" as const, formId: "form-2", reason: "new" as const }));
    const saveForm = vi.fn(async () => undefined);
    const showConfirmModal = vi.fn();
    const showModal = vi.fn();
    const showSaveChangesModal = vi.fn();
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [IModalService, { showConfirmModal, showModal, showSaveChangesModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { canSaveForm: () => canSave, getArrival, loadForm, saveForm }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const dataManager: IReportViewerDataManager<any> = { read: async () => undefined, ...(readTemplates ? { readTemplates } : {}) };
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(NewFormOption, { catalogItem: { name: "Stub Form", version: "1.0" } as never, controllers, dataManager, onError: vi.fn(), showModal: vi.fn(), title: "Start a new form" }))));
    mounted.push(() => act(() => root.unmount()));

    const click = async (): Promise<void> => { await act(async () => { container.querySelector<HTMLElement>("#new-form-button")!.click(); }); };

    /** The dialog the picker opened, and what it was given: the template it would be left on, and the actions under it. */
    const picker = () => {
        const options = showModal.mock.calls.at(-1)![0];
        const press = async (title: string): Promise<void> => { await act(async () => { await options.actions.find((action: { title: string }) => action.title === title).invoke(); }); };

        return { cancel: () => press("Cancel"), choose: (id?: string) => options.contentProps.onChange(id), close: () => act(async () => { await options.close.invoke(); }), contentProps: options.contentProps, start: () => press("Start"), title: options.title };
    };

    return { click, controllers, dataManager, getArrival, loadForm, newForm, picker, saveForm, showConfirmModal, showModal, showNotification, showSaveChangesModal };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("NewFormOption", () => {
    describe("with nothing unsaved", () => {
        it("starts a new form straight away, asking the data manager for a new record", async () => {
            const { click, dataManager, loadForm } = mount();

            await click();

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", undefined);
        });

        it("puts the new form in place of the old", async () => {
            const { click, controllers, newForm } = mount();

            await click();

            expect(controllers.getFormController().form).toBe(newForm);
        });

        it("replaces the audit history and the comments with those of the new report, not the last one's", async () => {
            const { click, controllers } = mount();
            getReviewController(controllers).load([{ ...previousComment, id: "last-report" }]);

            await click();

            expect(getReviewController(controllers).comments).toEqual([previousComment]);
            expect(getAuditController(controllers).history.map(record => record.id)).toContain("old-1");
        });

        it("records the old form closing, and then the new form starting, since the audit is told how it arrived before it goes in", async () => {
            const { click, controllers, getArrival, newForm } = mount();

            await click();

            expect(getArrival).toHaveBeenCalledWith(expect.objectContaining({ form: newForm }));
            expect(getAuditController(controllers).session.map(record => record.kind)).toEqual(["form-opened", "form-closed", "form-started"]);
            expect(getAuditController(controllers).session.at(-1)).toMatchObject({ kind: "form-started", reason: "new" });
        });

        it("says why when the new form could not be started", async () => {
            const { click, loadForm, showNotification } = mount();
            loadForm.mockRejectedValue(new Error("No such form."));

            await click();

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "No such form." });
        });
    });

    describe("with unsaved changes the host cannot save", () => {
        it("asks before discarding them, and starts the new form only once confirmed", async () => {
            const { click, loadForm, showConfirmModal } = mount({ isDirty: true });

            await click();

            expect(showConfirmModal).toHaveBeenCalledTimes(1);
            expect(loadForm).not.toHaveBeenCalled();

            await act(async () => { await showConfirmModal.mock.calls[0][0].onConfirm(); });

            expect(loadForm).toHaveBeenCalledTimes(1);
        });
    });

    describe("with unsaved changes the host can save", () => {
        it("offers to save them, discard them or keep editing", async () => {
            const { click, loadForm, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();

            expect(showSaveChangesModal).toHaveBeenCalledTimes(1);
            expect(loadForm).not.toHaveBeenCalled();
        });

        it("saves them, with the controllers, records that it did, and then starts the new form", async () => {
            const { click, controllers, dataManager, loadForm, saveForm, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); });

            expect(saveForm).toHaveBeenCalledWith(expect.anything(), dataManager, controllers);
            expect(getAuditController(controllers).session.map(record => record.kind)).toContain("saved");
            expect(loadForm).toHaveBeenCalledTimes(1);
        });

        it("records the save under the revision it saved", async () => {
            const { click, controllers, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); });

            expect(getAuditController(controllers).session.find(record => record.kind === "saved")).toMatchObject({ form: { id: "form-1", revision: 1 } });
        });

        it("records a save that failed, and does not start the new form", async () => {
            const { click, controllers, loadForm, saveForm, showSaveChangesModal } = mount({ canSave: true, isDirty: true });
            saveForm.mockRejectedValue(new Error("offline"));

            await click();

            await expect(act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); })).rejects.toThrow("offline");
            expect(getAuditController(controllers).session.map(record => record.kind)).toContain("save-failed");
            expect(loadForm).not.toHaveBeenCalled();
        });

        it("starts the new form without saving when the changes are discarded", async () => {
            const { click, loadForm, saveForm, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onDiscard(); });

            expect(saveForm).not.toHaveBeenCalled();
            expect(loadForm).toHaveBeenCalledTimes(1);
        });
    });

    describe("with templates", () => {
        it("starts from the form's own default without asking when the host lists none", async () => {
            const { click, dataManager, loadForm, showModal } = mount({ readTemplates: async () => [] });

            await click();

            expect(showModal).not.toHaveBeenCalled();
            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", undefined);
        });

        it("starts from the host's default without asking when it is the only thing to start from", async () => {
            const { click, dataManager, loadForm, showModal } = mount({ readTemplates: async () => [standard] });

            await click();

            expect(showModal).not.toHaveBeenCalled();
            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", "standard");
        });

        it("asks what to start from, and starts nothing yet, when there is more than one thing", async () => {
            const { click, loadForm, picker, showModal } = mount({ readTemplates: async () => [speeding, standard] });

            await click();

            expect(showModal).toHaveBeenCalledTimes(1);
            expect(picker().title).toBe("Start a new form");
            expect(loadForm).not.toHaveBeenCalled();
        });

        it("offers the form's own default, and leaves it selected, when the host names no default of its own", async () => {
            const { click, picker } = mount({ readTemplates: async () => [speeding] });

            await click();

            expect(picker().contentProps).toMatchObject({ includeBlank: true, selected: undefined, templates: [speeding] });
        });

        it("leaves out the form's own default, and selects the host's, when the host names one", async () => {
            const { click, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();

            expect(picker().contentProps).toMatchObject({ includeBlank: false, selected: "standard", templates: [speeding, standard] });
        });

        it("starts from the template chosen when Start is pressed", async () => {
            const { click, dataManager, loadForm, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();
            picker().choose("speeding");
            await picker().start();

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", "speeding");
        });

        it("starts from the one it was left on when Start is pressed without choosing", async () => {
            const { click, dataManager, loadForm, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();
            await picker().start();

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", "standard");
        });

        it("starts from the form's own default when that is what was chosen", async () => {
            const { click, dataManager, loadForm, picker } = mount({ readTemplates: async () => [speeding] });

            await click();
            picker().choose("speeding");
            picker().choose(undefined);
            await picker().start();

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", undefined);
        });

        it("puts the new form in place of the old once one is chosen", async () => {
            const { click, controllers, newForm, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();
            await picker().start();

            expect(controllers.getFormController().form).toBe(newForm);
        });

        it("starts nothing, and leaves the form as it is, when Cancel is pressed", async () => {
            const { click, controllers, loadForm, picker } = mount({ readTemplates: async () => [speeding, standard] });
            const before = controllers.getFormController().form;

            await click();
            await picker().cancel();

            expect(loadForm).not.toHaveBeenCalled();
            expect(controllers.getFormController().form).toBe(before);
        });

        it("starts nothing when the dialog is closed", async () => {
            const { click, loadForm, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();
            await picker().close();

            expect(loadForm).not.toHaveBeenCalled();
        });

        it("does not ask about unsaved changes when the picker is cancelled, since nothing is being replaced", async () => {
            const { click, picker, showConfirmModal, showSaveChangesModal } = mount({ isDirty: true, readTemplates: async () => [speeding, standard] });

            await click();
            await picker().cancel();

            expect(showConfirmModal).not.toHaveBeenCalled();
            expect(showSaveChangesModal).not.toHaveBeenCalled();
        });

        it("asks about unsaved changes only once a template is chosen, and starts from that template once they are dealt with", async () => {
            const { click, dataManager, loadForm, picker, showConfirmModal } = mount({ isDirty: true, readTemplates: async () => [speeding, standard] });

            await click();

            expect(showConfirmModal).not.toHaveBeenCalled();

            picker().choose("speeding");
            await picker().start();

            expect(showConfirmModal).toHaveBeenCalledTimes(1);
            expect(loadForm).not.toHaveBeenCalled();

            await act(async () => { await showConfirmModal.mock.calls[0][0].onConfirm(); });

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new", "speeding");
        });

        it("says so, and starts nothing, when the templates could not be listed", async () => {
            const { click, loadForm, showModal, showNotification } = mount({ readTemplates: async () => { throw new Error("offline"); } });

            await click();

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The templates could not be loaded." });
            expect(showModal).not.toHaveBeenCalled();
            expect(loadForm).not.toHaveBeenCalled();
        });
    });
});
