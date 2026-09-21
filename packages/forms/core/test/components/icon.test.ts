import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FIcon from "../../src/components/icon/icon";

type Props = Parameters<typeof FIcon>[0];

const render = (props: Props): string => renderToStaticMarkup(createElement(FIcon, props));

describe("FIcon", () => {
    it("shows the named bootstrap icon", () => {
        expect(render({ icon: "printer" })).toContain("bi bi-printer");
    });

    it("is small and secondary by default", () => {
        const markup = render({ icon: "printer" });

        expect(markup).toContain("fs-6");
        expect(markup).toContain("text-secondary");
    });

    it.each([
        ["sm", "fs-6"],
        ["md", "fs-4"],
        ["lg", "fs-2"]
    ] as const)("is drawn at the %s size as %s", (size, expected) => {
        expect(render({ icon: "printer", size })).toContain(expected);
    });

    it("takes a colour", () => {
        expect(render({ icon: "printer", variant: "danger" })).toContain("text-danger");
    });
});
