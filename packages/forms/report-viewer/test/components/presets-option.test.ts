import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { IServiceCollection } from "@shrub/core";

import { PresetsOption } from "../../src/components/options/presets-option";
import { IPresetSelectorService } from "../../src/services/preset-selector";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function mount() {
    const openSelector = vi.fn();
    const registry = new Map<unknown, unknown>([[IPresetSelectorService, { openSelector }]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(PresetsOption, { catalogItem: {} as never, controllers: {} as never, onError: vi.fn(), showModal: vi.fn(), title: "Apply a preset" }))));
    mounted.push(() => act(() => root.unmount()));

    return { button: container.querySelector<HTMLElement>("#presets-button")!, openSelector };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PresetsOption", () => {
    it("is a button", () => {
        expect(mount().button).not.toBeNull();
    });

    it("asks for the presets panel to open when it is clicked, and not before", () => {
        const { button, openSelector } = mount();

        expect(openSelector).not.toHaveBeenCalled();

        act(() => button.click());

        expect(openSelector).toHaveBeenCalledTimes(1);
    });

    it("asks again each time it is clicked", () => {
        const { button, openSelector } = mount();

        act(() => button.click());
        act(() => button.click());

        expect(openSelector).toHaveBeenCalledTimes(2);
    });
});
