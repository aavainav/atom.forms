// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { getFieldControl, getFieldId } from "../../src/utils/field-control";

/** Draws a control the way the components do: the attribute on its root, the input inside it. */
function drawControl(fieldId: string): HTMLElement {
    const control = document.createElement("div");
    control.innerHTML = `<div class="f-field-control-content"><input id="${fieldId}"></div>`;

    control.setAttribute("data-field-id", fieldId);
    document.body.append(control);

    return control;
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("getFieldControl", () => {
    it("finds the control drawing a field", () => {
        const control = drawControl("field-1");
        drawControl("field-2");

        expect(getFieldControl("field-1")).toBe(control);
    });

    it("answers null when no control draws the field", () => {
        drawControl("field-1");

        expect(getFieldControl("field-2")).toBeNull();
    });

    it("copes with an id carrying a quote or a backslash", () => {
        expect(getFieldControl('odd"id\\')).toBeNull();
    });
});

describe("getFieldId", () => {
    it("reads the field from an element nested inside its control", () => {
        const control = drawControl("field-1");

        expect(getFieldId(control.querySelector("input")!)).toBe("field-1");
    });

    it("reads the field from the control itself", () => {
        expect(getFieldId(drawControl("field-1"))).toBe("field-1");
    });

    it("answers undefined outside any control", () => {
        const stray = document.createElement("div");
        document.body.append(stray);

        expect(getFieldId(stray)).toBeUndefined();
    });
});
