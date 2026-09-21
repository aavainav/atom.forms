import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FContainer from "../../src/components/container/container";

type Props = Parameters<typeof FContainer>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FContainer, props, createElement("p", undefined, "Inside")));

describe("FContainer", () => {
    it("is a normal, rounded, transparent container around its content by default", () => {
        const markup = render();

        expect(markup).toContain("f-container container bg-transparent rounded");
        expect(markup).toContain("<p>Inside</p>");
    });

    it("can span the whole width", () => {
        const markup = render({ type: "fluid" });

        expect(markup).toContain("container-fluid");
        expect(markup).not.toContain(" container ");
    });

    it("lays its children in a row when horizontal, and stacks them otherwise", () => {
        expect(render({ orientation: "horizontal" })).toContain("d-flex");
        expect(render({ orientation: "vertical" })).not.toContain("d-flex");
        expect(render({ orientation: "none" })).not.toContain("d-flex");
    });

    it("takes a background colour", () => {
        expect(render({ backgroundColor: "primary" })).toContain("bg-primary");
    });

    it("can have square corners", () => {
        expect(render({ backgroundRounded: false })).not.toContain("rounded");
    });

    it("can have no gutters", () => {
        expect(render({ gutters: false })).toContain("g-0");
        expect(render()).not.toContain("g-0");
    });

    it("can fill the height of the viewport", () => {
        expect(render({ fill: true })).toContain("h-100");
        expect(render()).not.toContain("h-100");
    });

    it("carries the id it is given", () => {
        expect(render({ id: "main" })).toContain('id="main"');
    });

    it("takes a padding", () => {
        expect(render({ padding: 10 })).toContain("padding-top:10px");
        expect(render({ padding: { y: 6 } })).toContain("padding-bottom:6px");
    });
});
