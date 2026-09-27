import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import type { AuditRecord } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
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
    const loaded = { audit: [previousAudit], comments: [previousComment], form: newForm };
    const loadForm = vi.fn(async () => loaded);
    // the service seats the form and tells the audit; what it is asked, and what it answers, is all the option sees
    const openForm = vi.fn();
    const save = vi.fn(async () => undefined);
    const showConfirmModal = vi.fn();
    const showModal = vi.fn();
    const showSaveChangesModal = vi.fn();
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [IModalService, { showConfirmModal, showModal, showSaveChangesModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { canSaveForm: () => canSave, loadForm, openForm, save }]
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

    return { click, controllers, dataManager, loaded, loadForm, picker, openForm, save, showConfirmModal, showModal, showNotification, showSaveChangesModal };
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

        it("has the service put the new form in place of the old, with what the host held for it", async () => {
            const { click, controllers, loaded, openForm } = mount();

            await click();

            expect(openForm).toHaveBeenCalledTimes(1);
            expect(openForm).toHaveBeenCalledWith(controllers, loaded);
        });

        it("says why, and puts nothing in place, when the new form could not be started", async () => {
            const { click, loadForm, openForm, showNotification } = mount();
            loadForm.mockRejectedValue(new Error("No such form."));

            await click();

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "No such form." });
            expect(openForm).not.toHaveBeenCalled();
        });

        it("says why when the new form could not be put in place", async () => {
            const { click, openForm, showNotification } = mount();
            openForm.mockImplementation(() => { throw new Error("The form would not go in."); });

            await click();

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The form would not go in." });
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

        it("has the service save them, with the controllers and the data manager, and then starts the new form", async () => {
            const { click, controllers, dataManager, loadForm, save, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); });

            expect(save).toHaveBeenCalledWith(controllers, dataManager);
            expect(loadForm).toHaveBeenCalledTimes(1);
        });

        it("saves them before it starts the new form", async () => {
            const { click, loadForm, save, showSaveChangesModal } = mount({ canSave: true, isDirty: true });
            const order: Array<string> = [];
            save.mockImplementationOnce(async () => { order.push("save"); });
            loadForm.mockImplementationOnce(async () => { order.push("load"); return { audit: [], comments: [], form: stubForm("form-2", false) }; });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); });

            expect(order).toEqual(["save", "load"]);
        });

        it("does not start the new form, and lets the save's reason through, when the save fails", async () => {
            const { click, loadForm, save, showSaveChangesModal } = mount({ canSave: true, isDirty: true });
            save.mockRejectedValue(new Error("offline"));

            await click();

            await expect(act(async () => { await showSaveChangesModal.mock.calls[0][0].onSave(); })).rejects.toThrow("offline");
            expect(loadForm).not.toHaveBeenCalled();
        });

        it("starts the new form without saving when the changes are discarded", async () => {
            const { click, loadForm, save, showSaveChangesModal } = mount({ canSave: true, isDirty: true });

            await click();
            await act(async () => { await showSaveChangesModal.mock.calls[0][0].onDiscard(); });

            expect(save).not.toHaveBeenCalled();
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

        it("has the service put the new form in place of the old once one is chosen", async () => {
            const { click, controllers, loaded, openForm, picker } = mount({ readTemplates: async () => [speeding, standard] });

            await click();
            await picker().start();

            expect(openForm).toHaveBeenCalledWith(controllers, loaded);
        });

        it("starts nothing, and leaves the form as it is, when Cancel is pressed", async () => {
            const { click, controllers, loadForm, openForm, picker } = mount({ readTemplates: async () => [speeding, standard] });
            const before = controllers.getFormController().form;

            await click();
            await picker().cancel();

            expect(loadForm).not.toHaveBeenCalled();
            expect(openForm).not.toHaveBeenCalled();
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
