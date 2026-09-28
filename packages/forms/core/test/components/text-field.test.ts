// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import FTextField from "../../src/components/fields/text-field";
import { StringFieldModel } from "../../src/models/string-field";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Types into an input the way a user would; React ignores a value set straight on the element. */
function type(input: HTMLInputElement, value: string): void {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    act(() => {
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

describe("FTextField", () => {
    type Props = Parameters<typeof FTextField>[0];
    const field = new StringFieldModel({ label: "First Name", name: "firstName", value: "" });
    const render = (props: Partial<Props> = {}): string => renderToStaticMarkup(createElement(FTextField, { field, onChange: () => {}, ...props }));

    it("shows the field's own label by default", () => {
        expect(render()).toContain("First Name");
    });

    it("shows a given label instead of the field's own", () => {
        const markup = render({ label: "Given Name" });

        expect(markup).toContain("Given Name");
        expect(markup).not.toContain("First Name");
    });

    it("shows no label when told not to", () => {
        expect(render({ showLabel: false })).not.toContain("<label");
    });

    it("is identified by the field's own id", () => {
        expect(render()).toContain(`id="${field.id}"`);
        expect(render()).toContain(`for="${field.id}"`);
    });

    it("reflects the field's enabled and error state", () => {
        const markup = render({ field: field.setIsEnabled(false).setHasError(true) });

        expect(markup).toContain("disabled=\"\"");
        expect(markup).toContain("is-invalid");
    });

    it("shows the field's current value", () => {
        expect(render({ field: field.setValue("Dana") })).toContain('value="Dana"');
    });

    it("forwards a change straight through, unconverted", () => {
        const onChange = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FTextField, { field, onChange })));
        type(container.querySelector("input")!, "Dana");

        expect(onChange).toHaveBeenCalledWith("Dana");
        act(() => root.unmount());
    });
});
