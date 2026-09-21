import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FFormStackPanel from "../../src/components/form-stackpanel/form-stackpanel";

type Props = Parameters<typeof FFormStackPanel>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FFormStackPanel, props, createElement("p", undefined, "Inside")));

describe("FFormStackPanel", () => {
    it("stacks its children vertically by default", () => {
        const markup = render();

        expect(markup).toContain("f-form-stackpanel d-flex flex-column");
        expect(markup).toContain("<p>Inside</p>");
    });

    it("lays its children in a row when horizontal", () => {
        const markup = render({ direction: "horizontal" });

        expect(markup).toContain("flex-row");
        expect(markup).not.toContain("flex-column");
    });

    it("fixes its height, and stops it shrinking", () => {
        const markup = render({ height: 200 });

        expect(markup).toContain("height:200px");
        expect(markup).toContain("flex-shrink:0");
    });

    it("sets no height when it is given none", () => {
        expect(render()).not.toContain("style=");
    });
});
