// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import Tooltip from "bootstrap/js/dist/tooltip";
import { afterEach, describe, expect, it } from "vitest";

import FTooltip from "../../src/components/tooltip/tooltip";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FTooltip>[0];

const mounted: Array<() => void> = [];

function mount(props: Props = {}) {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FTooltip, props, createElement("button", undefined, "Save"))));

    const unmount = (): void => act(() => root.unmount());
    mounted.push(unmount);

    return { element: container.firstElementChild as HTMLElement, unmount };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FTooltip", () => {
    it("wraps what it is given, which the tooltip belongs to", () => {
        expect(mount().element.querySelector("button")!.textContent).toBe("Save");
    });

    it("is a bootstrap tooltip, placed above what it wraps by default", () => {
        const { element } = mount({ title: "Save" });

        expect(element.getAttribute("data-bs-toggle")).toBe("tooltip");
        expect(element.getAttribute("data-bs-placement")).toBe("top");
    });

    it("takes a placement", () => {
        expect(mount({ placement: "left", title: "Save" }).element.getAttribute("data-bs-placement")).toBe("left");
    });

    it("hands its title over to bootstrap, which reads it once and moves it out of the way of the browser's own", () => {
        const { element } = mount({ title: "Save the report" });

        expect(element.getAttribute("data-bs-original-title")).toBe("Save the report");
        expect(element.hasAttribute("title")).toBe(false);
    });

    it("builds a bootstrap tooltip on what it wraps", () => {
        expect(Tooltip.getInstance(mount({ title: "Save" }).element)).not.toBeNull();
    });

    it("lets the tooltip go when it is removed", () => {
        const { element, unmount } = mount({ title: "Save" });

        unmount();

        expect(Tooltip.getInstance(element)).toBeNull();
    });
});
