// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { ViolationsOption } from "../../src/components/violations-option";
import type { IViolationBinding } from "../../src/models/violation-binding";
import { IViolationSelectorService, IViolationService } from "../../src/services";
import { createBinding, createStubForm } from "../fixtures/stub-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function mount(form: FormModel<any>, binding: IViolationBinding | null = createBinding()) {
    const controllers = new ControllerManager();
    controllers.loadForm(form);

    const openSelector = vi.fn();
    const registry = new Map<unknown, unknown>([
        [IViolationSelectorService, { openSelector }],
        [IViolationService, { getBinding: () => binding ?? undefined }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as unknown as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ViolationsOption, { catalogItem: {} as never, controllers, title: "Violations" }))));
    mounted.push(() => act(() => root.unmount()));

    const button = () => container.querySelector<HTMLButtonElement>("#violations-button")!;

    return { button, controllers, openSelector };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ViolationsOption", () => {
    it("opens the selector when it is clicked", () => {
        const { button, openSelector } = mount(createStubForm());

        act(() => button().click());

        expect(button().disabled).toBe(false);
        expect(openSelector).toHaveBeenCalledTimes(1);
    });

    it("is disabled once the form is no longer editable, and opens nothing", () => {
        const { button, openSelector } = mount(createStubForm({ mode: "viewable" }));

        act(() => button().click());

        expect(button().disabled).toBe(true);
        expect(openSelector).not.toHaveBeenCalled();
    });

    it("is disabled while the form has locked the pages a violation lands on, though it is still editable", () => {
        expect(mount(createStubForm({ lockedPageSets: ["citation"] })).button().disabled).toBe(true);
    });

    it("stays open while the form has locked only some other set of pages", () => {
        expect(mount(createStubForm({ lockedPageSets: ["notice"] })).button().disabled).toBe(false);
    });

    it("closes as the form does, without being remounted", () => {
        const { button, controllers } = mount(createStubForm());

        expect(button().disabled).toBe(false);

        act(() => controllers.getFormController().update(() => createStubForm({ lockedPageSets: ["citation"] })));

        expect(button().disabled).toBe(true);
    });

    it("is not disabled for a form that declares no binding, which has nothing to close", () => {
        expect(mount(createStubForm({ mode: "viewable" }), null).button().disabled).toBe(false);
    });
});
