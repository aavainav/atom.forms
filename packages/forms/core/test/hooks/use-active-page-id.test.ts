// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import { useActivePageId } from "../../src/hooks/use-active-page-id";
import { cleanupHooks, renderHook } from "../fixtures/render-hook";

afterEach(cleanupHooks);

describe("useActivePageId", () => {
    it("answers nothing while no page is showing", () => {
        const controller = new ControllerManager().getNavigationController();

        expect(renderHook(() => useActivePageId(controller)).result.current).toBeUndefined();
    });

    it("answers the page the controller says is showing", () => {
        const controller = new ControllerManager().getNavigationController();
        controller.setActivePage("page-1");

        expect(renderHook(() => useActivePageId(controller)).result.current).toBe("page-1");
    });

    it("follows the page as it changes, and answers nothing again when none is showing", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useActivePageId(controller));

        act(() => controller.setActivePage("page-1"));
        expect(hook.result.current).toBe("page-1");

        act(() => controller.setActivePage("page-2"));
        expect(hook.result.current).toBe("page-2");

        act(() => controller.setActivePage(undefined));
        expect(hook.result.current).toBeUndefined();
    });

    it("does not render again for the page it already has", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useActivePageId(controller));

        act(() => controller.setActivePage("page-1"));
        const rendersBefore = hook.renders();

        act(() => controller.setActivePage("page-1"));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("does not render again for a navigation, which is not a change of page showing", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useActivePageId(controller));
        const rendersBefore = hook.renders();

        act(() => controller.goTo({ fieldId: "field-1", pageId: "page-1" }));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("stops listening to the controller when it is unmounted", () => {
        const controller = new ControllerManager().getNavigationController();
        const hook = renderHook(() => useActivePageId(controller));
        hook.unmount();
        const rendersBefore = hook.renders();

        act(() => controller.setActivePage("page-1"));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("listens to the controller it is handed now, and not the one it was handed before", () => {
        const first = new ControllerManager().getNavigationController();
        const second = new ControllerManager().getNavigationController();
        let controller = first;
        const hook = renderHook(() => useActivePageId(controller));

        controller = second;
        hook.rerender();

        act(() => first.setActivePage("page-1"));
        expect(hook.result.current).toBeUndefined();

        act(() => second.setActivePage("page-2"));
        expect(hook.result.current).toBe("page-2");
    });
});
