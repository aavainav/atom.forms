import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { IOptionValue } from "@forms/core";

import { useOptions } from "../../src/components/fields";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const alpha: IOptionValue = { value: "01", description: "Alpha" };
const bravo: IOptionValue = { value: "02", description: "Bravo" };

const mounted: Array<() => void> = [];

/** Calls the hook from inside a component, since no testing library is installed to render a bare one. */
function mount(load: () => Promise<Array<IOptionValue>>) {
    const result = { current: [] as Array<IOptionValue> };
    let loader = load;

    function Probe(): null {
        result.current = useOptions(loader);
        return null;
    }

    const root = createRoot(document.createElement("div"));
    const render = (): void => { act(() => root.render(createElement(Probe))); };

    render();
    mounted.push(() => act(() => root.unmount()));

    return {
        result,
        rerender: (next: () => Promise<Array<IOptionValue>>) => { loader = next; render(); },
        unmount: () => { mounted.splice(0).forEach(unmount => unmount()); }
    };
}

/** Lets the list the hook asked for settle. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

const deferred = () => {
    let resolve!: (options: Array<IOptionValue>) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<Array<IOptionValue>>((done, fail) => { resolve = done; reject = fail; });

    return { promise, reject, resolve };
};

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("useOptions", () => {
    it("answers an empty list until the list has loaded", () => {
        expect(mount(() => new Promise(() => undefined)).result.current).toEqual([]);
    });

    it("answers the options once they have loaded", async () => {
        const { result } = mount(async () => [alpha, bravo]);

        await settle();

        expect(result.current).toEqual([alpha, bravo]);
    });

    it("asks for the list once, however often it is rendered with the same loader", async () => {
        const load = vi.fn(async () => [alpha]);
        const { rerender } = mount(load);

        await settle();
        rerender(load);
        rerender(load);
        await settle();

        expect(load).toHaveBeenCalledTimes(1);
    });

    it("asks again, and answers the new list, when it is given a different loader", async () => {
        const { rerender, result } = mount(async () => [alpha]);
        await settle();

        rerender(async () => [bravo]);
        await settle();

        expect(result.current).toEqual([bravo]);
    });

    it("hears nothing from a list that a newer loader has replaced, however late it arrives", async () => {
        const first = deferred();
        const second = deferred();
        const { rerender, result } = mount(() => first.promise);

        rerender(() => second.promise);
        second.resolve([bravo]);
        await settle();
        first.resolve([alpha]);
        await settle();

        expect(result.current).toEqual([bravo]);
    });

    it("hears nothing from a list that arrives after it has been removed", async () => {
        const pending = deferred();
        const { result, unmount } = mount(() => pending.promise);

        unmount();
        pending.resolve([alpha]);
        await settle();

        expect(result.current).toEqual([]);
    });

    it("stays empty for a list that will not load, rather than failing the page", async () => {
        const { result } = mount(async () => { throw new Error("offline"); });

        await settle();

        expect(result.current).toEqual([]);
    });
});
