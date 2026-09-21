import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FSpinner from "../../src/components/spinner/spinner";

type Props = Parameters<typeof FSpinner>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FSpinner, props));

describe("FSpinner", () => {
    it("is a primary spinner that tells assistive technology it is loading", () => {
        const markup = render();

        expect(markup).toContain("spinner-border text-primary");
        expect(markup).toContain('role="status"');
        expect(markup).toContain('<span class="visually-hidden">Loading...</span>');
    });

    it("can be small", () => {
        expect(render({ size: "sm" })).toContain("spinner-border-sm");
        expect(render()).not.toContain("spinner-border-sm");
    });

    it("takes a colour", () => {
        expect(render({ variant: "secondary" })).toContain("text-secondary");
    });
});
