import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FForm from "../../src/components/form/form";
import type { FormModel } from "../../src/models/form";

describe("FForm", () => {
    const form = { id: "form-1" } as FormModel<any>;

    it("is identified by the form's id", () => {
        expect(renderToStaticMarkup(createElement(FForm, { form }))).toContain('id="form-1"');
    });

    it("fills the width and height of the viewport", () => {
        expect(renderToStaticMarkup(createElement(FForm, { form }))).toContain("f-form container-fluid min-vh-100");
    });

    it("stacks its children in a centred column", () => {
        const markup = renderToStaticMarkup(createElement(FForm, { form }, createElement("p", undefined, "Page")));

        expect(markup).toContain("d-flex flex-column align-items-center");
        expect(markup).toContain("<p>Page</p>");
    });
});
