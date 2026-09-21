// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FNavTab from "../../src/components/nav-tab/nav-tab";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const Pane = ({ text }: { readonly text: string }) => createElement("p", undefined, text);

const mounted: Array<() => void> = [];

function mount(onSelect?: (name: string) => void): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FNavTab, {
        id: "tabs",
        defaultTab: "first",
        style: "tabs",
        onSelect,
        pairs: [
            { tab: { name: "first", title: "First", disabled: false }, pane: { content: Pane, props: { text: "First pane" } } },
            { tab: { name: "second", title: "Second", disabled: false }, pane: { content: Pane, props: { text: "Second pane" } } },
            { tab: { name: "third", title: "Third", disabled: true }, pane: { content: Pane, props: { text: "Third pane" } } }
        ]
    })));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

function tab(container: HTMLElement, title: string): HTMLElement {
    return Array.from(container.querySelectorAll<HTMLElement>(".nav-link")).find(link => link.textContent === title)!;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FNavTab", () => {
    it("shows the pane of the default tab, and only that one", () => {
        const container = mount();

        expect(container.textContent).toContain("First pane");
        expect(container.textContent).not.toContain("Second pane");
    });

    it("takes a plain component as a pane, not only a lazy one", () => {
        expect(mount().querySelector(".tab-pane p")!.textContent).toBe("First pane");
    });

    it("shows the pane of the tab selected, and says which it was", () => {
        const onSelect = vi.fn();
        const container = mount(onSelect);

        act(() => tab(container, "Second").click());

        expect(container.textContent).toContain("Second pane");
        expect(container.textContent).not.toContain("First pane");
        expect(onSelect).toHaveBeenCalledWith("second");
    });

    it("does not select a disabled tab", () => {
        const onSelect = vi.fn();
        const container = mount(onSelect);

        act(() => tab(container, "Third").click());

        expect(container.textContent).toContain("First pane");
        expect(onSelect).not.toHaveBeenCalled();
    });
});
