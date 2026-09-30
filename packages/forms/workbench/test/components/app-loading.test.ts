import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import AppLoading from "../../src/components/app-loading";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function mount(): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(AppLoading)));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("AppLoading", () => {
    it("shows a spinner", () => {
        expect(mount().querySelector(".spinner-border")).not.toBeNull();
    });

    it("tells assistive technology that the app is loading", () => {
        const status = mount().querySelector("[role=status]");

        expect(status?.textContent).toBe("Loading...");
    });
});
