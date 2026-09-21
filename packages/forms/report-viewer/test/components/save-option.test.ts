import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { getAuditController } from "@forms/audit";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { SaveOption } from "../../src/components/options/save-option";
import { INotificationService } from "../../src/services/notification";
import { IReportViewerService } from "../../src/services/report-viewer";
import type { IReportViewerDataManager } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function mount(saveForm: (...args: Array<unknown>) => Promise<unknown>) {
    const form = { id: "form-1", mode: "editable", name: "Stub Form", status: "draft", version: "1.0", clean() { return this; } } as unknown as FormModel<any>;
    const controllers = new ControllerManager();
    controllers.loadForm(form);

    const dataManager = { read: async () => undefined, write: async () => undefined } as IReportViewerDataManager<any>;
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [INotificationService, { showNotification }],
        [IReportViewerService, { saveForm }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as unknown as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(SaveOption, { catalogItem: {} as never, controllers, dataManager, onError: vi.fn(), showModal: vi.fn(), title: "Save" }))));
    mounted.push(() => act(() => root.unmount()));

    return { audit: getAuditController(controllers), container, controllers, dataManager, form, showNotification };
}

async function save(container: HTMLElement): Promise<void> {
    await act(async () => { container.querySelector<HTMLElement>("#save-button")!.click(); });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("SaveOption", () => {
    it("saves the form as it is when it is clicked, through the data manager and with the controllers", async () => {
        const saveForm = vi.fn(async () => undefined);
        const { container, controllers, dataManager, form } = mount(saveForm);

        await save(container);

        expect(saveForm).toHaveBeenCalledWith(form, dataManager, controllers);
    });

    it("records the save, and says so", async () => {
        const { audit, container, showNotification } = mount(async () => undefined);

        await save(container);

        expect(audit.session.map(record => record.kind)).toEqual(["form-opened", "saved"]);
        expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Report saved." });
    });

    it("records a save that failed, and says why", async () => {
        const { audit, container, showNotification } = mount(async () => { throw new Error("The record is locked."); });

        await save(container);

        expect(audit.session.map(record => record.kind)).toEqual(["form-opened", "save-failed"]);
        expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The record is locked." });
    });

    it("gives a reason of its own when the failure has none", async () => {
        const { container, showNotification } = mount(async () => { throw "offline"; });

        await save(container);

        expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "The report could not be saved." });
    });
});
