// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDisposables } from "../../src/utils/disposable";
import { cleanupHooks, renderHook } from "../fixtures/render-hook";

afterEach(cleanupHooks);

describe("useDisposables", () => {
    it("disposes a function it was given when it is unmounted", () => {
        const dispose = vi.fn();
        const hook = renderHook(() => useDisposables());

        hook.result.current.add(dispose);
        expect(dispose).not.toHaveBeenCalled();

        hook.unmount();

        expect(dispose).toHaveBeenCalledTimes(1);
    });

    it("disposes an object with a dispose method, called on the object itself", () => {
        const hook = renderHook(() => useDisposables());
        const disposable = {
            disposed: false,
            dispose(): void { this.disposed = true; }
        };

        hook.result.current.add(disposable);
        hook.unmount();

        expect(disposable.disposed).toBe(true);
    });

    it("removes an event listener, which is disposed of by removing it", () => {
        const hook = renderHook(() => useDisposables());
        const listener = { remove: vi.fn() };

        hook.result.current.add(listener);
        hook.unmount();

        expect(listener.remove).toHaveBeenCalledTimes(1);
    });

    it("disposes of everything added, in the order it was added", () => {
        const hook = renderHook(() => useDisposables());
        const order: Array<string> = [];

        hook.result.current.add(() => order.push("function"));
        hook.result.current.add({ dispose: () => order.push("object") });
        hook.result.current.add({ remove: () => order.push("listener") });
        hook.unmount();

        expect(order).toEqual(["function", "object", "listener"]);
    });

    it("disposes of nothing while it is mounted, however often it renders", () => {
        const dispose = vi.fn();
        const hook = renderHook(() => useDisposables());
        hook.result.current.add(dispose);

        hook.rerender();
        hook.rerender();

        expect(dispose).not.toHaveBeenCalled();
    });

    it("disposes of what was added on an earlier render as well as what was added on a later one", () => {
        const early = vi.fn();
        const late = vi.fn();
        const hook = renderHook(() => useDisposables());
        hook.result.current.add(early);

        hook.rerender();
        hook.result.current.add(late);
        hook.unmount();

        expect(early).toHaveBeenCalledTimes(1);
        expect(late).toHaveBeenCalledTimes(1);
    });

    it("has nothing to dispose of when nothing was added", () => {
        const hook = renderHook(() => useDisposables());

        expect(() => hook.unmount()).not.toThrow();
    });
});
