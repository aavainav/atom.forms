import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FBorder from "../../src/components/border/border";

type Props = Parameters<typeof FBorder>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FBorder, props, createElement("span", undefined, "Inside")));

describe("FBorder", () => {
    it("draws a border on all four edges by default, around its content", () => {
        const markup = render();

        expect(markup).toContain("border-top");
        expect(markup).toContain("border-end");
        expect(markup).toContain("border-bottom");
        expect(markup).toContain("border-start");
        expect(markup).toContain("<span>Inside</span>");
    });

    it("draws only the edges it is given", () => {
        const markup = render({ borderEdges: ["top", "bottom"] });

        expect(markup).toContain("border-top");
        expect(markup).toContain("border-bottom");
        expect(markup).not.toContain("border-end");
        expect(markup).not.toContain("border-start");
    });

    it("draws a single named edge", () => {
        const markup = render({ borderEdges: ["left"] });

        expect(markup).toContain("border-start");
        expect(markup).not.toContain("border-top");
    });

    it("draws no edges when the border is hidden", () => {
        const markup = render({ border: "hidden" });

        expect(markup).toContain("border-0");
        expect(markup).not.toContain("border-top");
        expect(markup).not.toContain("border-bottom");
    });

    it("fixes its width and height, and stops them shrinking", () => {
        const markup = render({ height: 40, width: 120 });

        expect(markup).toContain("width:120px");
        expect(markup).toContain("height:40px");
        expect(markup).toContain("flex-shrink:0");
    });

    it("sets no size when it is given none", () => {
        expect(render()).not.toContain("style=");
    });

    it("lays its content out as a flex row when it is aligned or justified, and not otherwise", () => {
        expect(render()).not.toContain("d-flex");
        expect(render({ contentAlignment: "center" })).toContain("d-flex align-items-center");
        expect(render({ contentJustify: "between" })).toContain("d-flex justify-content-between");
    });
});
