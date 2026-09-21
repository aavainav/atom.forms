// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import FButton from "../../src/components/button/button";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FButton>[0];

const render = (props: Props = {}): string => renderToStaticMarkup(createElement(FButton, props));

describe("FButton", () => {
    describe("as a button", () => {
        it("is a primary button that does not submit, by default", () => {
            const markup = render({ text: "Save" });

            expect(markup).toContain("<button");
            expect(markup).toContain('type="button"');
            expect(markup).toContain("btn btn-primary");
            expect(markup).toContain(">Save<");
        });

        it.each([
            ["danger", "btn-danger"],
            ["outline-secondary", "btn-outline-secondary"],
            ["link", "btn-link"]
        ] as const)("takes the %s variant", (variant, expected) => {
            expect(render({ variant })).toContain(expected);
        });

        it("adds no variant class for the none variant", () => {
            expect(render({ variant: "none" })).not.toContain("btn-none");
        });

        it.each([
            ["small", "btn-sm"],
            ["large", "btn-lg"]
        ] as const)("takes the %s size", (size, expected) => {
            expect(render({ size })).toContain(expected);
        });

        it("has no shadow when told not to", () => {
            expect(render({ shadow: false })).toContain("shadow-none");
            expect(render()).not.toContain("shadow-none");
        });

        it("can be submit or reset", () => {
            expect(render({ type: "submit" })).toContain('type="submit"');
            expect(render({ type: "reset" })).toContain('type="reset"');
        });

        it("can be disabled", () => {
            expect(render({ disabled: true })).toContain("disabled");
        });

        it("carries the id and class it is given", () => {
            const markup = render({ className: "extra", id: "save-button" });

            expect(markup).toContain('id="save-button"');
            expect(markup).toContain("extra");
        });

        it("shows an icon, spaced from the text beside it", () => {
            expect(render({ icon: "bi bi-plus", text: "Add" })).toContain('class="bi bi-plus pe-1"');
        });

        it("shows an icon on its own without the spacing", () => {
            const markup = render({ icon: "bi bi-plus" });

            expect(markup).toContain('class="bi bi-plus"');
            expect(markup).not.toContain("pe-1");
        });

        it("shows its children in place of the icon and text", () => {
            const markup = renderToStaticMarkup(createElement(FButton, { icon: "bi bi-plus", text: "Add" }, createElement("b", undefined, "Custom")));

            expect(markup).toContain("<b>Custom</b>");
            expect(markup).not.toContain("bi-plus");
        });

        it("has muted styling for the muted style, and outline muted styling for an outline variant", () => {
            expect(render({ buttonStyle: "muted", variant: "danger" })).toContain("btn-muted btn-muted-danger");
            expect(render({ buttonStyle: "muted", variant: "outline-danger" })).toContain("btn-muted-outline btn-muted-outline-danger");
        });

        it("has no muted variant class for the link and none variants", () => {
            expect(render({ buttonStyle: "muted", variant: "link" })).not.toContain("btn-muted-link");
            expect(render({ buttonStyle: "muted", variant: "none" })).not.toContain("btn-muted-none");
        });
    });

    describe("as a link", () => {
        it("is an anchor when it is given a link", () => {
            const markup = render({ link: "/reports", text: "Reports" });

            expect(markup).toContain("<a ");
            expect(markup).toContain('href="/reports"');
            expect(markup).toContain('role="link"');
        });

        it("is an anchor when its type says so, going nowhere and acting as a button", () => {
            const markup = render({ type: "link" });

            expect(markup).toContain('href="#"');
            expect(markup).toContain('role="button"');
        });

        it("is marked disabled and taken out of the tab order when it is disabled", () => {
            const markup = render({ disabled: true, link: "/reports" });

            expect(markup).toContain('aria-disabled="true"');
            expect(markup).toContain('tabindex="-1"');
            expect(markup).toContain("disabled");
        });
    });

    it("calls its click handler when it is clicked", () => {
        const onClick = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FButton, { text: "Save", onClick })));
        act(() => container.querySelector("button")!.click());
        act(() => root.unmount());

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
