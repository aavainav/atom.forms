import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FLabel from "../../src/components/form-label/form-label";

type Props = Parameters<typeof FLabel>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FLabel, props, "Owner"));

describe("FLabel", () => {
    it("shows its text as a small, secondary, left aligned block", () => {
        const markup = render();

        expect(markup).toContain("f-label d-block fs-6 text-start text-secondary");
        expect(markup).toContain(">Owner<");
    });

    it("takes a size, an alignment and a colour", () => {
        const markup = render({ fontSize: "3", textAlignment: "center", variant: "danger" });

        expect(markup).toContain("fs-3");
        expect(markup).toContain("text-center");
        expect(markup).toContain("text-danger");
    });

    it("sets no spacing of its own by default", () => {
        expect(render()).not.toContain("style=");
    });

    it("takes a margin and a padding", () => {
        const markup = render({ margin: { bottom: 16 }, padding: 4 });

        expect(markup).toContain("margin-bottom:16px");
        expect(markup).toContain("padding-top:4px");
    });
});
