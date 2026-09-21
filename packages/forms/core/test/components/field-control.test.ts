import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FFieldControl from "../../src/components/field-control/field-control";

type Props = Parameters<typeof FFieldControl>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FFieldControl, props, createElement("input", { id: "name" })));

describe("FFieldControl", () => {
    it("wraps the input it is given in its content area", () => {
        const markup = render();

        expect(markup).toContain('<div class="f-field-control-content"><input id="name"/></div>');
    });

    it("is identified as the control of its field by the id its label is for", () => {
        expect(render({ labelFor: "name" })).toContain('data-field-id="name"');
    });

    describe("the border", () => {
        it("is drawn on all four edges by default", () => {
            const markup = render();

            expect(markup).toContain("border-top");
            expect(markup).toContain("border-end");
            expect(markup).toContain("border-bottom");
            expect(markup).toContain("border-start");
        });

        it("is drawn only on the edges it is given", () => {
            const markup = render({ borderEdges: ["bottom", "left"] });

            expect(markup).toContain("border-bottom");
            expect(markup).toContain("border-start");
            expect(markup).not.toContain("border-top");
            expect(markup).not.toContain("border-end");
        });

        it("is not drawn when hidden", () => {
            const markup = render({ border: "hidden" });

            expect(markup).toContain("border-0");
            expect(markup).not.toContain("border-top");
        });
    });

    describe("the label", () => {
        it("sits above the control, linked to its input, in capitals", () => {
            const markup = render({ label: "Name", labelFor: "name" });

            expect(markup).toContain('for="name"');
            expect(markup).toContain("f-field-control-label form-label position-absolute fs-6 text-uppercase");
            expect(markup).toContain("Name");
        });

        it("is drawn only when there is one", () => {
            expect(render()).not.toContain("<label");
        });

        it("can be bold, and can keep its own case or capitalise it", () => {
            expect(render({ label: "Name", labelFontWeight: "bold" })).toContain("fw-bold");
            expect(render({ label: "Name", labelTextCase: "none" })).not.toContain("text-uppercase");
            expect(render({ label: "Name", labelTextCase: "capitalize" })).toContain("text-capitalize");
        });

        it("is offset a little from the control by default, and can be moved", () => {
            expect(render({ label: "Name" })).toContain("margin-inline-start:4px");
            expect(render({ label: "Name", labelMargin: { start: 10 } })).toContain("margin-inline-start:10px");
        });

        it("takes a padding", () => {
            expect(render({ label: "Name", labelPadding: { top: 2 } })).toContain("padding-top:2px");
        });

        it("marks a required field with an asterisk", () => {
            expect(render({ label: "Name", required: true })).toContain('<span class="text-danger">*</span>');
            expect(render({ label: "Name" })).not.toContain("text-danger");
        });
    });

    it("shows its description beneath the control", () => {
        const markup = render({ description: "As on the licence." });

        expect(markup).toContain('<small class="form-text text-muted d-inline-block">As on the licence.</small>');
        expect(render()).not.toContain("<small");
    });

    it("fixes its width and height, and stops them shrinking", () => {
        const markup = render({ height: 30, width: 200 });

        expect(markup).toContain("width:200px");
        expect(markup).toContain("height:30px");
        expect(markup).toContain("flex-shrink:0");
    });

    it("takes a margin and a padding", () => {
        const markup = render({ margin: { bottom: 6 }, padding: 3 });

        expect(markup).toContain("margin-bottom:6px");
        expect(markup).toContain("padding-top:3px");
    });
});
