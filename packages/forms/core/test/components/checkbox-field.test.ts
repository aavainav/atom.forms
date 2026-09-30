// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import FCheckboxField from "../../src/components/fields/checkbox-field";
import { BooleanFieldModel } from "../../src/models/boolean-field";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("FCheckboxField", () => {
    type Props = Parameters<typeof FCheckboxField>[0];
    // the model's own initializer resets whatever value the constructor is given, so the answer is set afterwards
    const field = new BooleanFieldModel({ label: "Void", name: "void", value: false });
    const render = (props: Partial<Props> = {}): string => renderToStaticMarkup(createElement(FCheckboxField, { field, onChange: () => {}, ...props }));

    it("shows the field's own label by default", () => {
        expect(render()).toContain("Void");
    });

    it("shows a label it is given in place of the field's", () => {
        expect(render({ label: "Voided" })).toContain("Voided");
    });

    it("shows whether the field is ticked", () => {
        expect(render({ field: field.setValue(true) })).toContain("checked=\"\"");
        expect(render()).not.toContain("checked=\"\"");
    });

    it("reflects the field's enabled and error state", () => {
        const markup = render({ field: field.setIsEnabled(false).setHasError(true) });

        expect(markup).toContain("disabled=\"\"");
        expect(markup).toContain("is-invalid");
    });

    it("hands back the new answer when it is clicked", () => {
        const onChange = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FCheckboxField, { field, onChange })));
        act(() => container.querySelector("input")!.click());

        expect(onChange).toHaveBeenCalledWith(true);
        act(() => root.unmount());
    });
});
