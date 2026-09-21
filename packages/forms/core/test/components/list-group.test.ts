import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FListGroup from "../../src/components/list-group/list-group";

type Props = Parameters<typeof FListGroup>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FListGroup, props, createElement("p", undefined, "Item")));

describe("FListGroup", () => {
    it("is a list group around its items", () => {
        const markup = render();

        expect(markup).toContain('class="list-group"');
        expect(markup).toContain("<p>Item</p>");
    });

    it("carries the id it is given", () => {
        expect(render({ id: "violations" })).toContain('id="violations"');
    });

    it("can be borderless, and can be flush", () => {
        expect(render({ borderless: true })).toContain("list-group list-group-borderless");
        expect(render({ flush: true })).toContain("list-group list-group-flush");
    });

    it("has neither by default", () => {
        const markup = render();

        expect(markup).not.toContain("borderless");
        expect(markup).not.toContain("flush");
    });
});
