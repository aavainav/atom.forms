// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FListGroupCheckbox from "../../src/components/list-group-checkbox/list-group-checkbox";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FListGroupCheckbox>[0];

const mounted: Array<() => void> = [];

function mount(props: Props): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FListGroupCheckbox, props)));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FListGroupCheckbox", () => {
    it("is a list group row with a checkbox and its label", () => {
        const container = mount({ label: "Speeding" });

        expect(container.querySelector("a.list-group-item")).not.toBeNull();
        expect(container.querySelector("input[type=checkbox]")).not.toBeNull();
        expect(container.textContent).toContain("Speeding");
    });

    it("shows its children in place of the label", () => {
        const container = mount({ children: createElement("b", undefined, "Custom"), label: "Ignored" });

        expect(container.querySelector("b")!.textContent).toBe("Custom");
        expect(container.textContent).not.toContain("Ignored");
    });

    it("carries the id it is given on the row", () => {
        expect(mount({ id: "code-1" }).querySelector("a.list-group-item")!.id).toBe("code-1");
    });

    it("shows whether it is checked", () => {
        expect(mount({ checked: true }).querySelector("input")!.checked).toBe(true);
        expect(mount({}).querySelector("input")!.checked).toBe(false);
    });

    it("shows the indeterminate state", () => {
        expect(mount({ indeterminate: true }).querySelector("input")!.indeterminate).toBe(true);
    });

    describe("toggling", () => {
        it("is toggled by a click anywhere on the row, without following the link", () => {
            const onChange = vi.fn();
            const container = mount({ checked: false, label: "Speeding", onChange });
            const event = new MouseEvent("click", { bubbles: true, cancelable: true });

            act(() => { container.querySelector("a")!.dispatchEvent(event); });

            expect(onChange).toHaveBeenCalledWith(true);
            expect(event.defaultPrevented).toBe(true);
        });

        it("says it has been toggled off when it was checked", () => {
            const onChange = vi.fn();
            const container = mount({ checked: true, onChange });

            act(() => container.querySelector("a")!.click());

            expect(onChange).toHaveBeenCalledWith(false);
        });

        it("is toggled by a click on the box itself, to the same state", () => {
            const onChange = vi.fn();
            const container = mount({ checked: false, onChange });

            act(() => container.querySelector("input")!.click());

            expect(onChange).toHaveBeenCalled();
            expect(onChange.mock.calls.every(([checked]) => checked === true)).toBe(true);
        });
    });

    describe("while disabled", () => {
        it("cannot be toggled from the row, and looks it", () => {
            const onChange = vi.fn();
            const container = mount({ disabled: true, onChange });

            act(() => container.querySelector("a")!.click());

            expect(onChange).not.toHaveBeenCalled();
            expect(container.querySelector("a")!.classList.contains("disabled")).toBe(true);
        });

        it("cannot be toggled from the box either, which sits on top of the row", () => {
            const onChange = vi.fn();
            const container = mount({ disabled: true, onChange });

            act(() => container.querySelector("input")!.click());

            expect(container.querySelector("input")!.disabled).toBe(true);
            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
