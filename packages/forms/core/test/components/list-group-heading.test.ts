import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FListGroupHeading from "../../src/components/list-group-heading/list-group-heading";

type Props = Parameters<typeof FListGroupHeading>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FListGroupHeading, props, "Court"));

describe("FListGroupHeading", () => {
    it("is a list group row, showing its content", () => {
        const markup = render();

        expect(markup).toContain('class="list-group-item ');
        expect(markup).toContain(">Court<");
    });

    it("carries the id it is given", () => {
        expect(render({ id: "heading-1" })).toContain('id="heading-1"');
    });

    it("cannot be acted on, being a title rather than one of the items", () => {
        const markup = render();

        expect(markup).not.toContain("list-group-item-action");
        expect(markup).not.toContain("<a ");
    });
});
