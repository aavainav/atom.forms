// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import FFieldCheckbox from "../../src/components/field-checkbox/field-checkbox";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FFieldCheckbox>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FFieldCheckbox, props));

const mounted: Array<() => void> = [];

function mount(props: Props): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FFieldCheckbox, props)));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FFieldCheckbox", () => {
    it("is an unchecked checkbox by default", () => {
        const markup = render({ id: "agree" });

        expect(markup).toContain('type="checkbox"');
        expect(markup).not.toContain("checked");
        expect(markup).toContain("form-check-input");
    });

    it("can be checked, and can be a radio or a switch", () => {
        expect(render({ checked: true })).toContain("checked");
        expect(render({ type: "radio" })).toContain('type="radio"');
        expect(render({ switch: true })).toContain("form-switch");
        expect(render()).not.toContain("form-switch");
    });

    it("can be disabled, and can be marked invalid", () => {
        expect(render({ disabled: true })).toContain("disabled");
        expect(render({ invalid: true })).toContain("is-invalid");
        expect(render()).not.toContain("is-invalid");
    });

    it("is identified as the control of its field by the id it is given", () => {
        expect(render({ id: "agree" })).toContain('data-field-id="agree"');
        expect(render({ id: "agree" })).toContain('id="agree"');
    });

    describe("the label", () => {
        it("shows the label it is given beside the box, linked to it, in capitals", () => {
            const markup = render({ id: "agree", label: "Agree" });

            expect(markup).toContain('for="agree"');
            expect(markup).toContain("f-field-checkbox-label form-check-label text-uppercase");
            expect(markup).toContain(">Agree<");
        });

        it("keeps the label's own case when told to", () => {
            expect(render({ label: "Agree", labelTextCase: "none" })).not.toContain("text-uppercase");
        });

        it("shows its children in place of the label", () => {
            const markup = renderToStaticMarkup(createElement(FFieldCheckbox, { label: "Ignored" }, createElement("b", undefined, "Custom")));

            expect(markup).toContain("<b>Custom</b>");
            expect(markup).not.toContain("Ignored");
        });

        it("draws no label, and closes up the gap where it would be, when there is none", () => {
            const markup = render({ id: "agree" });

            expect(markup).not.toContain("<label");
            expect(markup).toContain("ms-0");
            expect(markup).toContain("padding-inline-start:0");
        });

        it("takes a margin and a padding of its own", () => {
            const markup = render({ label: "Agree", labelMargin: { top: 2 }, labelPadding: { bottom: 3 } });

            expect(markup).toContain("margin-top:2px");
            expect(markup).toContain("padding-bottom:3px");
        });
    });

    it("takes a margin and a padding for the whole control", () => {
        const markup = render({ label: "Agree", margin: { bottom: 8 }, padding: { top: 5 } });

        expect(markup).toContain("margin-bottom:8px");
        expect(markup).toContain("padding-top:5px");
    });

    describe("toggling", () => {
        it("says what it has been toggled to", () => {
            const onChange = vi.fn();
            const container = mount({ checked: false, onChange });

            act(() => container.querySelector("input")!.click());

            expect(onChange).toHaveBeenCalledWith(true);
        });

        it("says it has been toggled off when it was checked", () => {
            const onChange = vi.fn();
            const container = mount({ checked: true, onChange });

            act(() => container.querySelector("input")!.click());

            expect(onChange).toHaveBeenCalledWith(false);
        });

        it("cannot be toggled while disabled", () => {
            const onChange = vi.fn();
            const container = mount({ disabled: true, onChange });

            act(() => container.querySelector("input")!.click());

            expect(onChange).not.toHaveBeenCalled();
        });

        it("can be toggled with nobody listening", () => {
            const container = mount({});

            expect(() => act(() => container.querySelector("input")!.click())).not.toThrow();
        });
    });

    it("shows the indeterminate state, which is a property and not an attribute, and follows it", () => {
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FFieldCheckbox, { indeterminate: true })));
        expect(container.querySelector("input")!.indeterminate).toBe(true);

        act(() => root.render(createElement(FFieldCheckbox, { indeterminate: false })));
        expect(container.querySelector("input")!.indeterminate).toBe(false);

        act(() => root.unmount());
    });
});
