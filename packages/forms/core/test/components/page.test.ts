// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FPage } from "../../src/components/page/page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FPage>[0];

const render = (props: Props): string => renderToStaticMarkup(createElement(FPage, props, createElement("p", undefined, "Fields")));

const mounted: Array<() => void> = [];

function mount(props: Props): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FPage, props, createElement("p", undefined, "Fields"))));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

/** Stubs the sizes `usePageScale` measures, since jsdom lays nothing out: the container's `clientWidth`, and the page's own current `offsetWidth`. */
function sizeElements(size: { readonly containerWidth: number; readonly pageWidth: number }): () => void {
    const restore = ([["clientWidth", "containerWidth"], ["offsetWidth", "pageWidth"]] as const).map(([property, key]) => {
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, property);
        Object.defineProperty(HTMLElement.prototype, property, { configurable: true, get: () => size[key] });

        return () => original ? Object.defineProperty(HTMLElement.prototype, property, original) : delete (HTMLElement.prototype as unknown as Record<string, unknown>)[property];
    });

    return () => restore.forEach(undo => undo());
}

function pageScale(container: HTMLElement): string {
    return container.querySelector<HTMLElement>(".f-page")!.style.getPropertyValue("--f-page-scale");
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
});

describe("FPage", () => {
    it("is a white, bordered sheet around its content", () => {
        const markup = render({ formType: "citation" });

        expect(markup).toContain("f-page bg-white border border-dark mb-3");
        expect(markup).toContain("<p>Fields</p>");
    });

    it("keeps to the light colour mode whichever mode the app is in, being a printed document", () => {
        expect(render({ formType: "citation" })).toContain('data-bs-theme="light"');
    });

    it.each([
        ["citation", "f-citation"],
        ["crash", "f-crash"],
        ["warning", "f-warning"],
        ["tow", "f-none"],
        ["none", "f-none"]
    ] as const)("styles a %s form's page as %s", (formType, expected) => {
        expect(render({ formType })).toContain(expected);
    });

    describe("adding and deleting pages", () => {
        it("offers neither without a handler for each", () => {
            const markup = render({ formType: "citation" });

            expect(markup).not.toContain("Add Page");
            expect(markup).not.toContain("btn-danger");
        });

        it("offers a delete button above the content when it can delete", () => {
            const markup = render({ formType: "citation", onDeletePage: () => undefined });

            expect(markup).toContain("btn-danger");
            expect(markup).toContain("bi-x");
            expect(markup.indexOf("btn-danger")).toBeLessThan(markup.indexOf("Fields"));
        });

        it("offers an add page button below the content when it can add", () => {
            const markup = render({ formType: "citation", onAddPage: () => undefined });

            expect(markup).toContain("Add Page");
            expect(markup.indexOf("Fields")).toBeLessThan(markup.indexOf("Add Page"));
        });

        it("calls the handler when the delete button is clicked", () => {
            const onDeletePage = vi.fn();
            const container = mount({ formType: "citation", onDeletePage });

            act(() => container.querySelector<HTMLElement>(".btn-danger")!.click());

            expect(onDeletePage).toHaveBeenCalledTimes(1);
        });

        it("calls the handler when the add page button is clicked", () => {
            const onAddPage = vi.fn();
            const container = mount({ formType: "citation", onAddPage });

            act(() => container.querySelector<HTMLElement>(".btn-light")!.click());

            expect(onAddPage).toHaveBeenCalledTimes(1);
        });
    });

    describe("scaling to fit its container", () => {
        it("carries no scale when it fits its container at its natural size", () => {
            const restore = sizeElements({ containerWidth: 1024, pageWidth: 1024 });

            try {
                expect(pageScale(mount({ formType: "crash" }))).toBe("1");
            } finally {
                restore();
            }
        });

        it("shrinks to fit a container narrower than its natural width", () => {
            const restore = sizeElements({ containerWidth: 800, pageWidth: 1024 });

            try {
                expect(pageScale(mount({ formType: "crash" }))).toBe("0.78125");
            } finally {
                restore();
            }
        });

        it("never shrinks past the floor, past which the container scrolls instead of the page shrinking further", () => {
            const restore = sizeElements({ containerWidth: 200, pageWidth: 1024 });

            try {
                expect(pageScale(mount({ formType: "crash" }))).toBe("0.7");
            } finally {
                restore();
            }
        });

        it("never grows past its natural size on a container wider than the page", () => {
            const restore = sizeElements({ containerWidth: 2000, pageWidth: 1024 });

            try {
                expect(pageScale(mount({ formType: "crash" }))).toBe("1");
            } finally {
                restore();
            }
        });

        it("re-measures when its container is resized", () => {
            let notify: () => void = () => undefined;
            (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
                constructor(callback: () => void) { notify = callback; }
                observe(): void { }
                disconnect(): void { }
            };

            let size = { containerWidth: 1024, pageWidth: 1024 };
            const restore = ([["clientWidth", "containerWidth"], ["offsetWidth", "pageWidth"]] as const).map(([property, key]) => {
                Object.defineProperty(HTMLElement.prototype, property, { configurable: true, get: () => size[key] });
                return () => delete (HTMLElement.prototype as unknown as Record<string, unknown>)[property];
            });

            try {
                const container = mount({ formType: "crash" });
                expect(pageScale(container)).toBe("1");

                size = { containerWidth: 512, pageWidth: 1024 };
                act(() => notify());

                expect(pageScale(container)).toBe("0.7");
            } finally {
                restore.forEach(undo => undo());
            }
        });

        it("stops watching for resizes when it is removed", () => {
            let disconnected = false;
            (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
                constructor() { }
                observe(): void { }
                disconnect(): void { disconnected = true; }
            };

            const restore = sizeElements({ containerWidth: 1024, pageWidth: 1024 });

            try {
                mount({ formType: "crash" });
                mounted.splice(0).forEach(unmount => unmount());

                expect(disconnected).toBe(true);
            } finally {
                restore();
            }
        });

        it("recovers the page's true natural width from what it measures while already scaled, rather than compounding across repeated resizes", () => {
            let notify: () => void = () => undefined;
            (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
                constructor(callback: () => void) { notify = callback; }
                observe(): void { }
                disconnect(): void { }
            };

            // 800 / 1024 = 0.78125; once that scale is applied, the page's own rendered width becomes 1024 * 0.78125 = 800
            let size = { containerWidth: 800, pageWidth: 1024 };
            const restore = ([["clientWidth", "containerWidth"], ["offsetWidth", "pageWidth"]] as const).map(([property, key]) => {
                Object.defineProperty(HTMLElement.prototype, property, { configurable: true, get: () => size[key] });
                return () => delete (HTMLElement.prototype as unknown as Record<string, unknown>)[property];
            });

            try {
                const container = mount({ formType: "crash" });
                expect(pageScale(container)).toBe("0.78125");

                // the container widens, and the page's own measured width now reflects the scale just applied rather than its natural width
                size = { containerWidth: 900, pageWidth: 800 };
                act(() => notify());

                expect(pageScale(container)).toBe("0.87890625");
            } finally {
                restore.forEach(undo => undo());
            }
        });
    });

    describe("the watermark", () => {
        it("stamps the page with the watermark it is given", () => {
            const markup = render({ formType: "citation", watermark: "DRAFT" });

            expect(markup).toContain("f-watermark");
            expect(markup).toContain("DRAFT");
        });

        it("carries no watermark when it is given none", () => {
            expect(render({ formType: "citation" })).not.toContain("f-watermark");
        });
    });
});
