import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FAccordion from "../../src/components/accordion/accordion";

describe("FAccordion", () => {
    it("shows its heading and its content", () => {
        const markup = renderToStaticMarkup(createElement(FAccordion, { id: "details", heading: "Details" }, createElement("p", undefined, "Inside")));

        expect(markup).toContain("<span>Details</span>");
        expect(markup).toContain("<p>Inside</p>");
    });

    it("starts collapsed", () => {
        const markup = renderToStaticMarkup(createElement(FAccordion, { id: "details", heading: "Details" }));

        expect(markup).toContain("accordion-button collapsed");
        expect(markup).toContain('aria-expanded="false"');
        expect(markup).toContain("accordion-collapse collapse");
    });

    it("wires its button to the panel it opens by the id it is given", () => {
        const markup = renderToStaticMarkup(createElement(FAccordion, { id: "details", heading: "Details" }));

        expect(markup).toContain('id="details"');
        expect(markup).toContain('data-bs-target="#accordion-collapse-details"');
        expect(markup).toContain('aria-controls="accordion-collapse-details"');
        expect(markup).toContain('id="accordion-collapse-details"');
    });

    it("shows an icon before the heading when given one", () => {
        const markup = renderToStaticMarkup(createElement(FAccordion, { id: "details", heading: "Details", icon: "info-circle" }));

        expect(markup).toContain("bi bi-info-circle");
    });

    it("draws no icon and no heading when it is given neither", () => {
        const markup = renderToStaticMarkup(createElement(FAccordion, { id: "details" }));

        expect(markup).not.toContain("<i ");
        expect(markup).not.toContain("<span>");
    });
});
