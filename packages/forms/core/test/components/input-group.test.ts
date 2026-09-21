import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FInputGroup from "../../src/components/input-group/input-group";

describe("FInputGroup", () => {
    it("groups its children as an input group", () => {
        const markup = renderToStaticMarkup(createElement(FInputGroup, undefined, createElement("input"), createElement("button", undefined, "Go")));

        expect(markup).toContain('<div class="input-group">');
        expect(markup).toContain("<input/>");
        expect(markup).toContain("<button>Go</button>");
    });
});
