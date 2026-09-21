import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FSection from "../../src/components/section/section";

describe("FSection", () => {
    it("wraps its content as a section", () => {
        const markup = renderToStaticMarkup(createElement(FSection, undefined, createElement("p", undefined, "Fields")));

        expect(markup).toBe('<div class="f-section"><p>Fields</p></div>');
    });
});
