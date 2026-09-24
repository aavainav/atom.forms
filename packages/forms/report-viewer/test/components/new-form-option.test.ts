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
import type { IReportViewerDataManager } from "../../src/services/report-viewer";

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

interface IMountOptions {
    readonly canSave?: boolean;
    readonly isDirty?: boolean;
}

function mount(options: IMountOptions = {}) {
    const { canSave = false, isDirty = false } = options;
    const controllers = new ControllerManager();
    controllers.loadForm(stubForm("form-1", isDirty));

    const newForm = stubForm("form-2", false);
    const loadForm = vi.fn(async () => ({ audit: [previousAudit], comments: [previousComment], form: newForm }));
    const saveForm = vi.fn(async () => undefined);
    const showConfirmModal = vi.fn();
    const showSaveChangesModal = vi.fn();
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [IModalService, { showConfirmModal, showSaveChangesModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { canSaveForm: () => canSave, loadForm, saveForm }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const dataManager = { read: async () => undefined } as IReportViewerDataManager<any>;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(NewFormOption, { catalogItem: { name: "Stub Form", version: "1.0" } as never, controllers, dataManager, onError: vi.fn(), showModal: vi.fn(), title: "Start a new form" }))));
    mounted.push(() => act(() => root.unmount()));

    const click = async (): Promise<void> => { await act(async () => { container.querySelector<HTMLElement>("#new-form-button")!.click(); }); };

    return { click, controllers, dataManager, loadForm, newForm, saveForm, showConfirmModal, showNotification, showSaveChangesModal };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("NewFormOption", () => {
    describe("with nothing unsaved", () => {
        it("starts a new form straight away, asking the data manager for a new record", async () => {
            const { click, dataManager, loadForm } = mount();

            await click();

            expect(loadForm).toHaveBeenCalledWith({ name: "Stub Form", version: "1.0" }, dataManager, "new");
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
});
