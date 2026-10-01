// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import FListGroupItem from "../../src/components/list-group-item/list-group-item";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FListGroupItem>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FListGroupItem, props, "Item"));

const mounted: Array<() => void> = [];

/** Mounts the item and gives back the element a user would click. */
function mount(props: Props): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FListGroupItem, props, "Item")));
    mounted.push(() => act(() => root.unmount()));

    return container.firstElementChild as HTMLElement;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FListGroupItem", () => {
    it("is a plain list group item, showing its content", () => {
        const markup = render();

        expect(markup).toContain("<div");
        expect(markup).toContain('class="list-group-item"');
        expect(markup).toContain(">Item<");
    });

    it("carries the id and class it is given", () => {
        const markup = render({ className: "extra", id: "row-1" });

        expect(markup).toContain('id="row-1"');
        expect(markup).toContain("extra list-group-item");
    });

    it("can be active", () => {
        expect(render({ active: true })).toContain("list-group-item active");
    });

    it("is an anchor when it has a link, and can be acted on", () => {
        const markup = render({ href: "#" });

        expect(markup).toContain("<a ");
        expect(markup).toContain('href="#"');
        expect(markup).toContain("list-group-item-action");
    });

    it("can be acted on when it has a click handler, though it has no link", () => {
        expect(render({ onClick: () => undefined })).toContain("list-group-item-action");
    });

    it("cannot be acted on when it has neither", () => {
        expect(render()).not.toContain("list-group-item-action");
    });

    it("is marked disabled when it is disabled, and not otherwise", () => {
        expect(render({ disabled: true })).toContain('aria-disabled="true"');
        expect(render({ disabled: true })).toContain("list-group-item disabled");
        expect(render()).not.toContain("aria-disabled");
    });

    describe("clicking", () => {
        it("calls the click handler", () => {
            const onClick = vi.fn();
            const element = mount({ onClick });

            act(() => element.click());

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("does not call the click handler while disabled, though it looks as though it could be clicked", () => {
            const onClick = vi.fn();
            const element = mount({ disabled: true, onClick });

            act(() => element.click());

            expect(onClick).not.toHaveBeenCalled();
        });

        it("stops a link being followed when told to prevent the default", () => {
            const element = mount({ href: "#", preventDefault: true });
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(true);
        });

        it("lets a link be followed otherwise", () => {
            const element = mount({ href: "#" });
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(false);
        });
    });

    describe("from the keyboard", () => {
        /** Presses a key on the element the way a user would. */
        function press(element: HTMLElement, key: string): KeyboardEvent {
            const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key });

            act(() => { element.dispatchEvent(event); });

            return event;
        }

        it("is a button that can be tabbed to when it has a click handler", () => {
            const element = mount({ onClick: vi.fn() });

            expect(element.getAttribute("role")).toBe("button");
            expect(element.tabIndex).toBe(0);
        });

        it.each([["Enter"], [" "]])("acts when %j is pressed, and keeps the key from doing anything else", key => {
            const onClick = vi.fn();
            const element = mount({ onClick });

            const event = press(element, key);

            expect(onClick).toHaveBeenCalledTimes(1);
            expect(event.defaultPrevented).toBe(true);
        });

        it("ignores other keys", () => {
            const onClick = vi.fn();

            press(mount({ onClick }), "a");

            expect(onClick).not.toHaveBeenCalled();
        });

        it("cannot be tabbed to or pressed while disabled", () => {
            const onClick = vi.fn();
            const element = mount({ disabled: true, onClick });

            press(element, "Enter");

            expect(element.hasAttribute("tabindex")).toBe(false);
            expect(onClick).not.toHaveBeenCalled();
        });

        it("is neither a button nor tabbed to when it cannot be acted on", () => {
            const element = mount({});

            expect(element.hasAttribute("role")).toBe(false);
            expect(element.hasAttribute("tabindex")).toBe(false);
        });
    });
});
