// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import FWatermark from "../../src/components/watermark/watermark";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FWatermark>[0];

const mounted: Array<() => void> = [];

/** Sizes the elements the watermark measures, since jsdom lays nothing out. */
function sizeElements(size: { readonly clientHeight: number; readonly clientWidth: number; readonly offsetWidth: number }): () => void {
    const restore = (["clientHeight", "clientWidth", "offsetWidth"] as const).map(name => {
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name);
        Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get: () => size[name] });

        return () => original ? Object.defineProperty(HTMLElement.prototype, name, original) : delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
    });

    return () => restore.forEach(undo => undo());
}

function mount(props: Props = {}): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FWatermark, props, "DRAFT")));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

const transform = (container: HTMLElement): string => container.querySelector<HTMLElement>(".f-watermark-content")!.style.transform;

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
});

describe("FWatermark", () => {
    it("shows its content, hidden from assistive technology since it stamps a copy and says nothing new", () => {
        const markup = renderToStaticMarkup(createElement(FWatermark, undefined, "DRAFT"));

        expect(markup).toContain("f-watermark");
        expect(markup).toContain('aria-hidden="true"');
        expect(markup).toContain(">DRAFT<");
    });

    it("runs from the top left corner to the bottom right, at the angle of the diagonal", () => {
        const restore = sizeElements({ clientHeight: 400, clientWidth: 300, offsetWidth: 150 });

        try {
            expect(transform(mount())).toContain("rotate(53.13");
        } finally {
            restore();
        }
    });

    it("spans the diagonal, less the fill it is given, whatever the size of the text", () => {
        const restore = sizeElements({ clientHeight: 400, clientWidth: 300, offsetWidth: 150 });

        try {
            // the diagonal is 500 and the default fill 0.9, over text 150 wide
            expect(transform(mount())).toContain("scale(3)");
            expect(transform(mount({ fill: 0.5 }))).toContain("scale(1.6666");
        } finally {
            restore();
        }
    });

    it("takes the angle it is given in place of the diagonal's", () => {
        const restore = sizeElements({ clientHeight: 400, clientWidth: 300, offsetWidth: 150 });

        try {
            expect(transform(mount({ angle: 30 }))).toContain("rotate(30deg)");
        } finally {
            restore();
        }
    });

    it("draws nothing until there is text to measure", () => {
        const restore = sizeElements({ clientHeight: 400, clientWidth: 300, offsetWidth: 0 });

        try {
            expect(transform(mount())).toContain("scale(0)");
        } finally {
            restore();
        }
    });

    it("measures again when the page or the text is resized", () => {
        let notify: () => void = () => undefined;
        (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
            constructor(callback: () => void) { notify = callback; }
            observe(): void { }
            disconnect(): void { }
        };

        let size = { clientHeight: 400, clientWidth: 300, offsetWidth: 150 };
        const restore = (["clientHeight", "clientWidth", "offsetWidth"] as const).map(name => {
            Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get: () => size[name] });
            return () => delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
        });

        try {
            const container = mount();
            expect(transform(container)).toContain("scale(3)");

            size = { clientHeight: 400, clientWidth: 300, offsetWidth: 300 };
            act(() => notify());

            expect(transform(container)).toContain("scale(1.5)");
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

        mount();
        mounted.splice(0).forEach(unmount => unmount());

        expect(disconnected).toBe(true);
    });
});
