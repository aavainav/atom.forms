// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { ViolationsPanel } from "../../src/components/violations-panel";
import type { IViolation } from "../../src/models/violation";
import { ViolationSelectorService } from "../../src/services/violation-selector";
import { IViolationSelectorService, IViolationService } from "../../src/services";
import { createBinding, createStubForm } from "../fixtures/stub-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const violations: ReadonlyArray<IViolation> = [
    { code: "56-5-1520", description: "Speeding" },
    { code: "56-1-20", description: "Driving without a licence" }
];

const mounted: Array<() => void> = [];

/** Mounts the panel and opens it, with the list loaded and the first violation ticked. */
async function mountWithATick(form: FormModel<any>, controllers: ControllerManager = new ControllerManager()) {
    controllers.loadForm(form);

    // the list is loaded when the panel opens, so the request is held until the test resolves it inside an act
    let release!: () => void;
    const apply = vi.fn((..._: Array<unknown>) => Promise.resolve());
    const onError = vi.fn();
    const selector = new ViolationSelectorService();
    const registry = new Map<unknown, unknown>([
        [IViolationSelectorService, selector],
        [IViolationService, { getBinding: () => createBinding(apply), getViolations: () => new Promise<ReadonlyArray<IViolation>>(resolve => { release = () => resolve(violations); }) }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ViolationsPanel, { catalogItem: {} as never, controllers, onError }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    act(() => { selector.openSelector(); });
    await act(async () => { release(); await Promise.resolve(); });
    act(() => container.querySelector<HTMLElement>("#violation-56-5-1520")!.click());

    return { add: () => container.querySelector<HTMLButtonElement>("#violations-add-button")!, apply, container, controllers, onError };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ViolationsPanel", () => {
    it("hands the ticked violations to the binding when Add is clicked, while the form is open", async () => {
        const { add, apply, onError } = await mountWithATick(createStubForm());

        await act(async () => add().click());

        expect(apply).toHaveBeenCalledTimes(1);
        expect(apply.mock.calls[0][1]).toEqual([violations[0]]);
        expect(onError).not.toHaveBeenCalled();
    });

    it("refuses to add once the form has closed its violations while the panel was open, and says so", async () => {
        const { add, apply, controllers, onError } = await mountWithATick(createStubForm());

        act(() => controllers.getFormController().update({ update: () => createStubForm({ lockedPageSets: ["citation"] }) }));
        await act(async () => add().click());

        expect(apply).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith("The violations cannot be changed on this form.");
    });

    it("refuses once the form is no longer editable, as it does for a locked page set", async () => {
        const { add, apply, controllers, onError } = await mountWithATick(createStubForm());

        act(() => controllers.getFormController().update({ update: () => createStubForm({ mode: "viewable" }) }));
        await act(async () => add().click());

        expect(apply).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
    });

    describe("favorites", () => {
        it("shows a violation already favorited in the user's preferences as starred", async () => {
            const controllers = new ControllerManager();
            controllers.setPreferences({ violationFavorites: { list: ["56-1-20"] } });

            const { container } = await mountWithATick(createStubForm(), controllers);

            expect(container.querySelector("#violation-favorite-56-1-20")!.className).toContain("bi-star-fill");
            expect(container.querySelector("#violation-favorite-56-5-1520")!.className).not.toContain("bi-star-fill");
        });

        it("adds a violation to the user's preferences when its star is clicked", async () => {
            const { container, controllers } = await mountWithATick(createStubForm());

            act(() => container.querySelector<HTMLElement>("#violation-favorite-56-1-20")!.click());

            expect(controllers.preferences).toEqual({ violationFavorites: { list: ["56-1-20"] } });
        });

        it("fills the star in immediately, on the same click that favorites it", async () => {
            const { container } = await mountWithATick(createStubForm());
            const star = container.querySelector<HTMLElement>("#violation-favorite-56-1-20")!;

            expect(star.className).not.toContain("bi-star-fill");
            act(() => star.click());

            expect(star.className).toContain("bi-star-fill");
        });

        it("removes a violation from the user's preferences when its star is clicked again", async () => {
            const controllers = new ControllerManager();
            controllers.setPreferences({ violationFavorites: { list: ["56-1-20"] } });

            const { container } = await mountWithATick(createStubForm(), controllers);
            act(() => container.querySelector<HTMLElement>("#violation-favorite-56-1-20")!.click());

            expect(controllers.preferences).toEqual({ violationFavorites: { list: [] } });
        });

        it("leaves another list's favorites untouched", async () => {
            const controllers = new ControllerManager();
            controllers.setPreferences({ violationFavorites: { "another-list": ["99-9-9999"] } });

            const { container } = await mountWithATick(createStubForm(), controllers);
            act(() => container.querySelector<HTMLElement>("#violation-favorite-56-1-20")!.click());

            expect(controllers.preferences).toEqual({ violationFavorites: { "another-list": ["99-9-9999"], list: ["56-1-20"] } });
        });

        it("sorts a favorited violation ahead of the rest of the list", async () => {
            const controllers = new ControllerManager();
            // 56-1-20 is the second violation in the unfiltered list, so this is only true once it is favorited
            controllers.setPreferences({ violationFavorites: { list: ["56-1-20"] } });

            const { container } = await mountWithATick(createStubForm(), controllers);
            const codes = [...container.querySelectorAll("#violation-list .list-group-item")].map(item => item.id.replace("violation-", ""));

            expect(codes[0]).toBe("56-1-20");
        });

        it("does not toggle the violation itself when its star is clicked", async () => {
            const { add, apply, container } = await mountWithATick(createStubForm());

            act(() => container.querySelector<HTMLElement>("#violation-favorite-56-1-20")!.click());
            await act(async () => add().click());

            // only the row already ticked before the star was clicked was applied
            expect(apply.mock.calls[0][1]).toEqual([violations[0]]);
        });
    });
});
