// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IPrintState } from "../../src/controllers/print-controller";
import { usePrintState } from "../../src/hooks/use-print-state";
import { cleanupHooks, renderHook } from "../fixtures/render-hook";

afterEach(cleanupHooks);

const state: IPrintState = { layout: "top-down", pageNames: ["citation"] };

describe("usePrintState", () => {
    it("answers nothing while the form is not printing", () => {
        const controller = new ControllerManager().getPrintController();

        expect(renderHook(() => usePrintState(controller)).result.current).toBeUndefined();
    });

    it("answers the state of a print in progress, as the very object the controller holds", () => {
        const controller = new ControllerManager().getPrintController();
        const hook = renderHook(() => usePrintState(controller));

        act(() => controller.begin(state));

        expect(hook.result.current).toBe(state);
        expect(hook.result.current).toBe(controller.state);
    });

    it("answers the new state when the print begins again with a measured scale", () => {
        const controller = new ControllerManager().getPrintController();
        const hook = renderHook(() => usePrintState(controller));
        const scaled = { ...state, scale: 0.5 };

        act(() => controller.begin(state));
        act(() => controller.begin(scaled));

        expect(hook.result.current).toBe(scaled);
    });

    it("answers nothing again once the print has ended", () => {
        const controller = new ControllerManager().getPrintController();
        const hook = renderHook(() => usePrintState(controller));

        act(() => controller.begin(state));
        act(() => controller.end());

        expect(hook.result.current).toBeUndefined();
    });

    it("does not render again for the end of a print that was not begun", () => {
        const controller = new ControllerManager().getPrintController();
        const hook = renderHook(() => usePrintState(controller));
        const rendersBefore = hook.renders();

        act(() => controller.end());

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("answers the same state when it is rendered again while nothing has changed", () => {
        const controller = new ControllerManager().getPrintController();
        controller.begin(state);
        const hook = renderHook(() => usePrintState(controller));

        hook.rerender();

        expect(hook.result.current).toBe(state);
    });

    it("stops listening to the controller when it is unmounted", () => {
        const controller = new ControllerManager().getPrintController();
        const hook = renderHook(() => usePrintState(controller));
        hook.unmount();
        const rendersBefore = hook.renders();

        act(() => controller.begin(state));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("listens to the controller it is handed now, and not the one it was handed before", () => {
        const first = new ControllerManager().getPrintController();
        const second = new ControllerManager().getPrintController();
        let controller = first;
        const hook = renderHook(() => usePrintState(controller));

        controller = second;
        hook.rerender();

        act(() => first.begin(state));
        expect(hook.result.current).toBeUndefined();

        act(() => second.begin(state));
        expect(hook.result.current).toBe(state);
    });
});
