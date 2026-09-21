import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FFieldTextArea from "../../src/components/field-textarea/field-textarea";

const render = (props: Parameters<typeof FFieldTextArea>[0] = {}): string => renderToStaticMarkup(createElement(FFieldTextArea, props));

describe("FFieldTextArea", () => {
    it("holds the text it is given, three lines tall", () => {
        const markup = render({ value: "Wrong date." });

        expect(markup).toContain("Wrong date.");
        expect(markup).toContain('rows="3"');
        expect(markup).toContain("form-control");
    });

    it("shows its placeholder while it is enabled, and hides it once it is disabled", () => {
        expect(render({ placeholder: "Add a comment" })).toContain('placeholder="Add a comment"');
        expect(render({ disabled: true, placeholder: "Add a comment" })).not.toContain("placeholder");
    });

    it("is named for assistive technology by its label", () => {
        expect(render({ label: "Add a comment" })).toContain('aria-label="Add a comment"');
    });

    it("marks itself invalid", () => {
        expect(render({ invalid: true })).toContain("is-invalid");
        expect(render()).not.toContain("is-invalid");
    });

    it("limits how much can be typed, and takes a margin", () => {
        const markup = render({ margin: { bottom: 8 }, maxlength: 200 });

        expect(markup).toContain('maxLength="200"');
        expect(markup).toContain("margin-bottom:8px");
    });
});
