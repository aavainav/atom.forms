// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import FNumberField from "../../src/components/fields/number-field";
import { NumberFieldModel } from "../../src/models/number-field";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Types into an input the way a user would; React ignores a value set straight on the element. */
function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

describe("FNumberField", () => {
    type Props = Parameters<typeof FNumberField>[0];
    const field = new NumberFieldModel({ label: "Weight", name: "weight", value: null });
    const render = (props: Partial<Props> = {}): string => renderToStaticMarkup(createElement(FNumberField, { field, onChange: () => {}, ...props }));

    it("shows the field's own label by default", () => {
        expect(render()).toContain("Weight");
    });

    it("shows no label when told not to", () => {
        expect(render({ showLabel: false })).not.toContain("<label");
    });

    it("reflects the field's enabled and error state", () => {
        const markup = render({ field: field.setIsEnabled(false).setHasError(true) });

        expect(markup).toContain("disabled=\"\"");
        expect(markup).toContain("is-invalid");
    });

    it("converts the input's text back to a number", () => {
        const onChange = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FNumberField, { field, onChange })));
        type(container.querySelector("input")!, "42");

        expect(onChange).toHaveBeenCalledWith(42);
        act(() => root.unmount());
    });

    it("shows a blank box for an unanswered field", () => {
        expect(render()).toContain("value=\"\"");
    });

    it("hands back null when the box is cleared", () => {
        const onChange = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FNumberField, { field: field.setValue(42), onChange })));
        type(container.querySelector("input")!, "");

        expect(onChange).toHaveBeenCalledWith(null);
        act(() => root.unmount());
    });
});
