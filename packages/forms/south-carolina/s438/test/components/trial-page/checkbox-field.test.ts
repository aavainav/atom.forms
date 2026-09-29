import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BooleanFieldModel } from "@forms/core";

import CheckboxField from "../../../src/components/trial-page/checkbox-field";
import { click, getInput, mount, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

function field(options: { readonly value?: boolean; readonly isEnabled?: boolean } = {}): BooleanFieldModel {
    // the model's own initializer resets whatever value the constructor is given, so the answer is set afterwards
    return new BooleanFieldModel({ name: "void", label: "Void", value: false }).setValue(options.value ?? false).setIsEnabled(options.isEnabled ?? true);
}

describe("CheckboxField", () => {
    it("labels the box with the field's own label", () => {
        const container = mount(createElement(CheckboxField, { field: field(), onChange: vi.fn() }));

        expect(container.textContent).toContain("Void");
    });

    it("shows whether the field is ticked", () => {
        const ticked = field({ value: true });
        mount(createElement(CheckboxField, { field: ticked, onChange: vi.fn() }));

        expect(getInput(ticked.id).checked).toBe(true);
    });

    it("hands back the new answer when it is clicked", () => {
        const unticked = field();
        const onChange = vi.fn();
        mount(createElement(CheckboxField, { field: unticked, onChange }));

        click(getInput(unticked.id));

        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("closes the box when the field is disabled", () => {
        const closed = field({ isEnabled: false });
        mount(createElement(CheckboxField, { field: closed, onChange: vi.fn() }));

        expect(getInput(closed.id).disabled).toBe(true);
    });
});
