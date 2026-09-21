import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export interface IRenderedHook<TResult> {
    /** What the hook answered the last time it ran. */
    readonly result: { readonly current: TResult };

    /** How many times the component calling the hook has rendered. */
    renders(): number;
    /** Renders again, calling a different hook when one is given. */
    rerender(hook?: () => TResult): void;
    /** Removes the component, letting its effects clean up. */
    unmount(): void;
}

const mounted: Array<() => void> = [];

/**
 * Calls a hook from inside a component, since no testing library is installed to render a bare one. It needs a
 * `jsdom` environment; a test file opts into one with a `// @vitest-environment jsdom` docblock.
 */
export function renderHook<TResult>(hook: () => TResult): IRenderedHook<TResult> {
    let current = hook;
    let renders = 0;
    const result = { current: undefined as TResult };

    function Probe(): null {
        renders += 1;
        result.current = current();

        return null;
    }

    const root = createRoot(document.createElement("div"));
    let isMounted = true;

    const unmount = (): void => {
        if (isMounted) {
            isMounted = false;
            act(() => root.unmount());
        }
    };

    act(() => root.render(createElement(Probe)));
    mounted.push(unmount);

    return {
        result,
        renders: () => renders,
        rerender: next => {
            current = next ?? current;
            act(() => root.render(createElement(Probe)));
        },
        unmount
    };
}

/** Removes every component rendered since the last call; a test file calls this from `afterEach`. */
export function cleanupHooks(): void {
    mounted.splice(0).forEach(unmount => unmount());
}
