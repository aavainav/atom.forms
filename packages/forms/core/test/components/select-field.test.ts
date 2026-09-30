// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FSelectField from "../../src/components/fields/select-field";
import type { IOptionValue } from "../../src/models/field";
import { OptionFieldModel } from "../../src/models/option-field";

describe("FSelectField", () => {
    type Props = Parameters<typeof FSelectField>[0];
    const alpha: IOptionValue = { value: "A", description: "Alpha" };
    const field = new OptionFieldModel({ label: "State", name: "state", value: { value: "", description: "" } });
    const load = async () => [alpha];
    const render = (props: Partial<Props> = {}): string => renderToStaticMarkup(createElement(FSelectField, { field, load, onChange: () => {}, ...props }));

    it("shows the field's own label by default", () => {
        expect(render()).toContain("State");
    });

    it("shows no label when told not to", () => {
        expect(render({ showLabel: false })).not.toContain("<label");
    });

    it("reflects the field's enabled and error state", () => {
        const markup = render({ field: field.setIsEnabled(false).setHasError(true) });

        expect(markup).toContain("disabled=\"\"");
        expect(markup).toContain("is-invalid");
    });

    it("closes the box when told to, on top of whatever the field itself says", () => {
        expect(render({ field: field.setIsEnabled(true), disabled: true })).toContain("disabled=\"\"");
    });

    it("shows the selected option's description by default", () => {
        expect(render({ field: field.setValue(alpha) })).toContain("Alpha");
    });

    it("shows its placeholder while nothing is chosen", () => {
        expect(render({ placeholder: "Select a make first" })).toContain("Select a make first");
    });

    it("keeps its placeholder while disabled only when told to", () => {
        const closed = field.setIsEnabled(false);

        expect(render({ field: closed, placeholder: "Select a make first" })).not.toContain("Select a make first");
        expect(render({ field: closed, placeholder: "Select a make first", showPlaceholderWhenDisabled: true })).toContain("Select a make first");
    });

    it("offers a search box by default, and none when told not to", () => {
        expect(render()).toContain("f-field-select__search");
        expect(render({ searchable: false })).not.toContain("f-field-select__search");
    });

    it("hides the box's border when told to", () => {
        expect(render({ border: "hidden" })).toContain("f-field-control position-relative border-dark border-0");
        expect(render()).not.toContain("f-field-control position-relative border-dark border-0");
    });

    it("shows just the value when told to", () => {
        const markup = render({ field: field.setValue(alpha), format: "valueOnly" });

        expect(markup).toContain(">A<");
        expect(markup).not.toContain("Alpha<");
    });
});
