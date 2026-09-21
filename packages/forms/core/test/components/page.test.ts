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

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
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
