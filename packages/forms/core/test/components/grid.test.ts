import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FGrid from "../../src/components/grid/grid";

describe("FGrid", () => {
    it("is a container around its content", () => {
        const markup = renderToStaticMarkup(createElement(FGrid, undefined, createElement("p", undefined, "Inside")));

        expect(markup).toContain("f-container container");
        expect(markup).toContain("<p>Inside</p>");
    });

    it("can span the whole width", () => {
        expect(renderToStaticMarkup(createElement(FGrid, { type: "fluid" }))).toContain("container-fluid");
    });

    it("can have no gutters, and can fill the height", () => {
        const markup = renderToStaticMarkup(createElement(FGrid, { fill: true, gutters: false }));

        expect(markup).toContain("g-0");
        expect(markup).toContain("h-100");
    });

    it("lays its children in a row when horizontal", () => {
        expect(renderToStaticMarkup(createElement(FGrid, { orientation: "horizontal" }))).toContain("d-flex");
    });
});

describe("FGrid.Row", () => {
    it("is a row around its content", () => {
        const markup = renderToStaticMarkup(createElement(FGrid.Row, undefined, createElement("p", undefined, "Inside")));

        expect(markup).toContain('class="row"');
        expect(markup).toContain("<p>Inside</p>");
    });

    it("can fill the height", () => {
        expect(renderToStaticMarkup(createElement(FGrid.Row, { fill: true }))).toContain("row h-100");
    });
});

describe("FGrid.Column", () => {
    it("is a column around its content", () => {
        const markup = renderToStaticMarkup(createElement(FGrid.Column, undefined, createElement("p", undefined, "Inside")));

        expect(markup).toContain('class="col"');
        expect(markup).toContain("<p>Inside</p>");
    });

    it("can size itself to its content", () => {
        expect(renderToStaticMarkup(createElement(FGrid.Column, { auto: true }))).toContain("col col-auto");
    });

    it("can fill the height", () => {
        expect(renderToStaticMarkup(createElement(FGrid.Column, { fill: true }))).toContain("col h-100");
    });
});
