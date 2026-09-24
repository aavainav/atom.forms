import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FBadge from "../../src/components/badge/badge";

type Props = Parameters<typeof FBadge>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FBadge, props, "3"));

describe("FBadge", () => {
    it("is a secondary badge holding what it is given", () => {
        expect(render()).toBe('<span class="badge text-bg-secondary">3</span>');
    });

    it("takes a colour", () => {
        expect(render({ variant: "danger" })).toContain("text-bg-danger");
    });

    it("can be a pill", () => {
        expect(render({ pill: true })).toContain("rounded-pill");
        expect(render()).not.toContain("rounded-pill");
    });

    it("can sit on the corner of its button", () => {
        expect(render({ overlay: true })).toContain("f-badge--overlay");
        expect(render()).not.toContain("f-badge--overlay");
    });

    it("says what it counts to assistive technology", () => {
        expect(render({ label: "open" })).toContain('<span class="visually-hidden"> open</span>');
        expect(render()).not.toContain("visually-hidden");
    });
});
