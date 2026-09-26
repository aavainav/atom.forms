// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import FOffCanvas from "../../src/components/off-canvas/off-canvas";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FOffCanvas>[0];

const render = (props: Props): string => renderToStaticMarkup(createElement(FOffCanvas, props, createElement("p", undefined, "Inside")));

describe("FOffCanvas", () => {
    it("is identified by the id it is given, with the panel suffix", () => {
        expect(render({ id: "validation", isOpen: false })).toContain('id="validation__offcanvas"');
    });

    it("shows its content", () => {
        expect(render({ id: "validation", isOpen: false })).toContain("<p>Inside</p>");
    });

    it("slides in from the start edge by default, and from the end edge when told to", () => {
        expect(render({ id: "validation", isOpen: false })).toContain("offcanvas offcanvas-start");
        expect(render({ id: "violations", isOpen: false, placement: "end" })).toContain("offcanvas offcanvas-end");
    });

    it("is shown only while it is open", () => {
        expect(render({ id: "validation", isOpen: true })).toContain("offcanvas-start show");
        expect(render({ id: "validation", isOpen: false })).not.toContain("show");
    });

    it("can be focused, for the keyboard to reach it", () => {
        expect(render({ id: "validation", isOpen: false })).toContain('tabindex="-1"');
    });
});

describe("FOffCanvas.Body", () => {
    it("holds the panel's content", () => {
        const markup = renderToStaticMarkup(createElement(FOffCanvas.Body, undefined, createElement("p", undefined, "List")));

        expect(markup).toBe('<div class="offcanvas-body"><p>List</p></div>');
    });
});

describe("FOffCanvas.Header", () => {
    const header = (props: Partial<Parameters<typeof FOffCanvas.Header>[0]> = {}): string =>
        renderToStaticMarkup(createElement(FOffCanvas.Header, { onClose: () => undefined, ...props }, createElement("h5", undefined, "Title")));

    it("shows its title beside a close button", () => {
        const markup = header();

        expect(markup).toContain("<h5>Title</h5>");
        expect(markup).toContain('aria-label="Close"');
        expect(markup).toContain("btn-close");
    });

    it("has no border under it by default, and has one when told to", () => {
        expect(header()).not.toContain("border-bottom");
        expect(header({ borderVisibility: "visible" })).toContain("border-bottom");
    });

    it("calls its close handler when the close button is clicked", () => {
        const onClose = vi.fn();
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(createElement(FOffCanvas.Header, { onClose })));
        act(() => container.querySelector<HTMLElement>(".btn-close")!.click());
        act(() => root.unmount());

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

describe("FOffCanvas.Footer", () => {
    const footer = (props: Partial<Parameters<typeof FOffCanvas.Footer>[0]> = {}): string =>
        renderToStaticMarkup(createElement(FOffCanvas.Footer, props, createElement("button", undefined, "Apply")));

    it("holds the panel's actions", () => {
        expect(footer()).toContain("<button>Apply</button>");
    });

    it("is the panel's footer, laid out with flex", () => {
        const markup = footer();

        expect(markup).toContain("f-offcanvas__footer");
        expect(markup).toContain("d-flex");
    });

    it("carries the id it is given, and none otherwise", () => {
        expect(footer({ id: "presets-footer" })).toContain('id="presets-footer"');
        expect(footer()).not.toContain("id=");
    });

    it("has no border above it by default, and has one when told to", () => {
        expect(footer()).not.toContain("border-top");
        expect(footer({ borderVisibility: "visible" })).toContain("border-top");
        expect(footer({ borderVisibility: "hidden" })).not.toContain("border-top");
    });

    it("lays its content out side by side by default, and one above the next when told to", () => {
        expect(footer()).toContain("flex-row");
        expect(footer()).not.toContain("flex-column");
        expect(footer({ direction: "vertical" })).toContain("flex-column");
        expect(footer({ direction: "vertical" })).not.toContain("flex-row");
        expect(footer({ direction: "horizontal" })).toContain("flex-row");
    });

    it("aligns its content only when told to", () => {
        expect(footer()).not.toContain("align-items");
        expect(footer({ contentAlignment: "center" })).toContain("align-items-center");
        expect(footer({ contentAlignment: "end" })).toContain("align-items-end");
    });

    it("justifies its content only when told to", () => {
        expect(footer()).not.toContain("justify-content");
        expect(footer({ contentJustify: "between" })).toContain("justify-content-between");
        expect(footer({ contentJustify: "end" })).toContain("justify-content-end");
    });

    it("keeps alignment, justification, direction and border apart, each with its own effect", () => {
        const markup = footer({ borderVisibility: "visible", contentAlignment: "center", contentJustify: "between", direction: "vertical" });

        expect(markup).toContain("flex-column border-top align-items-center justify-content-between");
    });

    describe("its padding", () => {
        it("is sixteen pixels on every side by default", () => {
            expect(footer()).toContain("padding-top:16px;padding-bottom:16px;padding-inline-start:16px;padding-inline-end:16px");
        });

        it("is the size it is given on every side, when given a bare size", () => {
            expect(footer({ padding: 8 })).toContain("padding-top:8px;padding-bottom:8px;padding-inline-start:8px;padding-inline-end:8px");
        });

        it("can be taken away", () => {
            expect(footer({ padding: 0 })).toContain("padding-top:0;padding-bottom:0;padding-inline-start:0;padding-inline-end:0");
        });

        it("changes only the sides it is given, leaving the rest at sixteen", () => {
            const markup = footer({ padding: { top: 2, x: 4 } });

            expect(markup).toContain("padding-top:2px");
            expect(markup).toContain("padding-bottom:16px");
            expect(markup).toContain("padding-inline-start:4px");
            expect(markup).toContain("padding-inline-end:4px");
        });
    });
});
