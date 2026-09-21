// @vitest-environment jsdom
import { act, createElement } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FAsyncLoader from "../../src/components/async-loader/async-loader";
import type { IAsyncLoaderController } from "../../src/components/async-loader/async-loader";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

interface IMountOptions {
    readonly children?: (result: string, controller: IAsyncLoaderController) => ReactNode;
    readonly loading?: ReactNode;
    readonly onInitialized?: (controller: IAsyncLoaderController) => void;
    readonly op: () => Promise<any>;
}

function mount(options: IMountOptions) {
    const container = document.createElement("div");
    const root = createRoot(container);

    const render = (op = options.op): void => {
        act(() => root.render(createElement(FAsyncLoader<string>, {
            loading: options.loading,
            op,
            onInitialized: options.onInitialized,
            children: options.children ?? ((result: string) => createElement("p", undefined, result))
        })));
    };

    render();
    mounted.push(() => act(() => root.unmount()));

    return { container, render };
}

/** Lets the operation resolve and the loader settle, which takes a couple of turns of the microtask queue. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FAsyncLoader", () => {
    it("shows a loading indicator while the operation is running", () => {
        const { container } = mount({ op: () => new Promise(() => undefined) });

        expect(container.querySelector(".spinner-border")).not.toBeNull();
    });

    it("shows the loading content it is given in place of the indicator", () => {
        const { container } = mount({ loading: createElement("i", { id: "custom-loading" }), op: () => new Promise(() => undefined) });

        expect(container.querySelector("#custom-loading")).not.toBeNull();
        expect(container.querySelector(".spinner-border")).toBeNull();
    });

    it("renders its children with the result once the operation resolves", async () => {
        const { container } = mount({ op: async () => "Dana" });

        await settle();

        expect(container.querySelector("p")!.textContent).toBe("Dana");
        expect(container.querySelector(".spinner-border")).toBeNull();
    });

    it("hands its children a controller that says it is no longer loading", async () => {
        let controller: IAsyncLoaderController | undefined;
        mount({ children: (result, given) => { controller = given; return createElement("p", undefined, result); }, op: async () => "Dana" });

        await settle();

        expect(controller!.isLoading).toBe(false);
    });

    it("renders nothing of its children when the operation resolves to nothing", async () => {
        const { container } = mount({ op: async () => undefined });

        await settle();

        expect(container.querySelector("p")).toBeNull();
        expect(container.querySelector(".spinner-border")).toBeNull();
    });

    it("runs the operation once when it mounts, and not again when it is rendered again", async () => {
        const op = vi.fn(async () => "Dana");
        const { render } = mount({ op });

        await settle();
        render(op);
        await settle();

        expect(op).toHaveBeenCalledTimes(1);
    });

    it("tells its owner it is ready, giving it the controller", async () => {
        const onInitialized = vi.fn();
        mount({ onInitialized, op: async () => "Dana" });

        await settle();

        expect(onInitialized).toHaveBeenCalledTimes(1);
        expect(onInitialized.mock.calls[0][0]).toEqual(expect.objectContaining({ reload: expect.any(Function) }));
    });

    it("runs the operation again, and shows the new result, when it is told to reload", async () => {
        let count = 0;
        let controller: IAsyncLoaderController | undefined;
        const { container } = mount({ onInitialized: given => { controller = given; }, op: async () => `Result ${++count}` });

        await settle();
        expect(container.querySelector("p")!.textContent).toBe("Result 1");

        act(() => controller!.reload());
        expect(controller!.isLoading).toBe(true);

        await settle();
        expect(container.querySelector("p")!.textContent).toBe("Result 2");
    });
});
