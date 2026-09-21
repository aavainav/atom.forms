// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import { useNavigationTarget } from "../../src/hooks/use-navigation-target";
import { cleanupHooks, renderHook } from "../fixtures/render-hook";

afterEach(cleanupHooks);

const target = { fieldId: "field-1", pageId: "page-1" };

describe("useNavigationTarget", () => {
    it("answers nothing while there is nowhere to go", () => {
        const controller = new ControllerManager().getNavigationController();

        expect(renderHook(() => useNavigationTarget(controller)).result.current).toBeUndefined();
    });

    it("answers where the controller has been asked to go", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useNavigationTarget(controller));

        act(() => controller.goTo(target));

        expect(hook.result.current).toBe(target);
    });

    it("answers nothing again once the navigation has been cleared", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useNavigationTarget(controller));

        act(() => controller.goTo(target));
        act(() => controller.clear());

        expect(hook.result.current).toBeUndefined();
    });

    it("renders again for each navigation, and not for the tracking of the page showing", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useNavigationTarget(controller));
        const rendersBefore = hook.renders();

        act(() => controller.setActivePage("page-1"));
        expect(hook.renders()).toBe(rendersBefore);

        act(() => controller.goTo(target));
        expect(hook.renders()).toBe(rendersBefore + 1);
    });

    it("answers the same target when it is rendered again while nothing has changed", () => {
        const controller = new ControllerManager().getNavigationController();
        controller.goTo(target);
        const hook = renderHook(() => useNavigationTarget(controller));

        hook.rerender();

        expect(hook.result.current).toBe(target);
    });

    it("stops listening to the controller when it is unmounted", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useNavigationTarget(controller));
        hook.unmount();
        const rendersBefore = hook.renders();

        act(() => controller.goTo(target));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("listens to the controller it is handed now, and not the one it was handed before", () => {
        const first = new ControllerManager().getNavigationController();
        const second = new ControllerManager().getNavigationController();
        let controller = first;
        const hook = renderHook(() => useNavigationTarget(controller));

        controller = second;
        hook.rerender();

        act(() => first.goTo(target));
        expect(hook.result.current).toBeUndefined();

        act(() => second.goTo({ fieldId: "field-2", pageId: "page-2" }));
        expect(hook.result.current).toEqual({ fieldId: "field-2", pageId: "page-2" });
    });
});
