import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager, FormMode, FormModel } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import PanelManager from "../../src/components/panel/manager";
import { IModalService } from "../../src/services/modal";
import { IPresetSelectorService, PresetSelectorService } from "../../src/services/preset-selector";
import { IReportViewerDataManager } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A form on the real form's prototype, so it is a form without a cast: the panels read only its mode and what extracting it gives. */
function stubForm(mode: FormMode): FormModel<any> {
    return Object.assign(Object.create(FormModel.prototype), {
        history: [],
        id: "form-1",
        mode,
        name: "Stub Form",
        status: "draft",
        type: "none",
        version: "1.0",
        extractData: () => ({ name: "Stub Form", status: "draft", type: "none", version: "1.0" }),
        getIsDirty: () => false,
        mapper: undefined
    });
}

const mounted: Array<() => void> = [];

/** Mounts the manager over a form and a host, and lets the panels it loads lazily arrive. */
async function mount(mode: FormMode, dataManager?: Partial<IReportViewerDataManager<any>>): Promise<HTMLElement> {
    const controllers = new ControllerManager();
    controllers.loadForm(stubForm(mode));

    const registry = new Map<unknown, unknown>([[IModalService, { showConfirmModal: vi.fn() }], [IPresetSelectorService, new PresetSelectorService()]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(PanelManager, { catalogItem: {} as never, controllers, dataManager: dataManager as IReportViewerDataManager<any>, onError: vi.fn() }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    // the panel is a lazy import, which takes real time to arrive; a panel that must not be mounted is given as long
    for (let turn = 0; turn < 10; turn++) {
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    }

    return container;
}

const host = { read: async () => undefined, readPresets: async () => [] };

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
});

describe("PanelManager", () => {
    describe("the presets panel", () => {
        it("is mounted for an editable report when the host has presets to give", async () => {
            expect((await mount("editable", host)).querySelector("#presets__offcanvas")).not.toBeNull();
        });

        it("is not mounted when the host has no way to read presets", async () => {
            expect((await mount("editable", { read: async () => undefined })).querySelector("#presets__offcanvas")).toBeNull();
        });

        it("is not mounted when there is no host at all", async () => {
            expect((await mount("editable")).querySelector("#presets__offcanvas")).toBeNull();
        });

        it.each<FormMode>(["reviewable", "viewable"])("is not mounted for a %s report, which cannot be edited", async mode => {
            expect((await mount(mode, host)).querySelector("#presets__offcanvas")).toBeNull();
        });
    });

    it("mounts no violations panel for a form that declares no violation list", async () => {
        expect((await mount("editable", host)).querySelector("#violations__offcanvas")).toBeNull();
    });
});
