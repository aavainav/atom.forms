import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FCode from "../../src/components/code/code";

type Props = Parameters<typeof FCode>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FCode, props, "{ \"name\": \"Dana\" }"));

describe("FCode", () => {
    it("shows its content as preformatted code in a panel", () => {
        const markup = render();

        expect(markup).toContain('<pre class="f-code"><code>');
        expect(markup).toContain("{ &quot;name&quot;: &quot;Dana&quot; }");
    });

    it("sets no spacing of its own by default", () => {
        expect(render()).not.toContain("style=");
    });

    it("takes a margin, on all sides when it is a bare size and per side when it is an object", () => {
        expect(render({ margin: 8 })).toContain("margin-top:8px");
        expect(render({ margin: { top: 12 } })).toContain("margin-top:12px");
        expect(render({ margin: { top: 12 } })).not.toContain("margin-bottom");
    });

    it("takes a padding", () => {
        expect(render({ padding: 4 })).toContain("padding-top:4px");
        expect(render({ padding: { x: 16 } })).toContain("padding-inline-start:16px");
    });
});
