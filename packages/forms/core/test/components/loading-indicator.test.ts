import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FLoadingIndicator from "../../src/components/loading-indicator/loading-indicator";

describe("FLoadingIndicator", () => {
    it("shows a spinner", () => {
        expect(renderToStaticMarkup(createElement(FLoadingIndicator, {}))).toContain("spinner-border");
    });

    it("shows the message beneath the spinner when it is given one", () => {
        const markup = renderToStaticMarkup(createElement(FLoadingIndicator, { message: "Loading S438..." }));

        expect(markup).toContain('<span class="text-muted">Loading S438...</span>');
    });

    it("shows no message when it is given none", () => {
        expect(renderToStaticMarkup(createElement(FLoadingIndicator, {}))).not.toContain("text-muted");
    });

    it("centres the spinner and the message", () => {
        expect(renderToStaticMarkup(createElement(FLoadingIndicator, {}))).toContain("d-flex flex-column align-items-center justify-content-center");
    });
});
