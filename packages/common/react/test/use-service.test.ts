import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createService } from "@shrub/core";
import type { IServiceCollection } from "@shrub/core";

import { ServicesContext, useService, useServices } from "../src/index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface IGreeter {
    greet(): string;
}

interface IClock {
    now(): number;
}

const IGreeter = createService<IGreeter>("test-greeter");
const IClock = createService<IClock>("test-clock");

const greeter: IGreeter = { greet: () => "Hello" };
const clock: IClock = { now: () => 42 };

const mounted: Array<() => void> = [];

/** A service collection holding what it is given, watching what is asked of it. */
function collection(...entries: Array<[unknown, unknown]>) {
    const registry = new Map<unknown, unknown>(entries);
    const get = vi.fn((service: unknown) => registry.get(service));

    return { get, services: { get } as unknown as IServiceCollection };
}

/** Calls the hook from inside a component, within a services provider unless told otherwise. */
function renderHook<TResult>(hook: () => TResult, services?: IServiceCollection) {
    const result = { current: undefined as TResult };
    let renders = 0;

    function Probe(): null {
        renders += 1;
        result.current = hook();

        return null;
    }

    const root = createRoot(document.createElement("div"));
    const element = services ? createElement(ServicesContext.Provider, { value: services }, createElement(Probe)) : createElement(Probe);

    act(() => root.render(element));
    mounted.push(() => act(() => root.unmount()));

    return { renders: () => renders, result, rerender: () => act(() => root.render(element)) };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("useServices", () => {
    it("answers the service collection of the provider it is rendered in", () => {
        const { services } = collection();

        expect(renderHook(() => useServices(), services).result.current).toBe(services);
    });

    it("throws when it is rendered outside of a provider", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

        try {
            expect(() => renderHook(() => useServices())).toThrow("useServices must be used within a ServicesProvider");
        } finally {
            error.mockRestore();
        }
    });
});

describe("useService", () => {
    it("answers the service the collection holds for the one asked for", () => {
        const { services } = collection([IGreeter, greeter]);

        expect(renderHook(() => useService<IGreeter>(IGreeter), services).result.current).toBe(greeter);
    });

    it("asks the collection for the service it is given, and no other", () => {
        const { get, services } = collection([IGreeter, greeter], [IClock, clock]);

        renderHook(() => useService<IClock>(IClock), services);

        expect(get).toHaveBeenCalledWith(IClock);
        expect(get).not.toHaveBeenCalledWith(IGreeter);
    });

    it("answers a different service for a different one asked for", () => {
        const { services } = collection([IGreeter, greeter], [IClock, clock]);

        expect(renderHook(() => useService<IGreeter>(IGreeter), services).result.current).toBe(greeter);
        expect(renderHook(() => useService<IClock>(IClock), services).result.current).toBe(clock);
    });

    it("answers the same service each time it is rendered", () => {
        const { services } = collection([IGreeter, greeter]);
        const hook = renderHook(() => useService<IGreeter>(IGreeter), services);

        hook.rerender();

        expect(hook.result.current).toBe(greeter);
    });

    it("throws when it is rendered outside of a provider", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

        try {
            expect(() => renderHook(() => useService<IGreeter>(IGreeter))).toThrow("useService must be used within a ServicesProvider");
        } finally {
            error.mockRestore();
        }
    });
});
