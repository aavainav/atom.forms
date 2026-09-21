// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FPageCollection from "../../src/components/page-collection/page-collection";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IControllerManager } from "../../src/controllers/controller-manager";
import type { FormMode, FormStatus } from "../../src/models/form";
import { addCitationPage, citationPage, createTestForm } from "../fixtures/citation-form";
import type { TestCitationForm } from "../fixtures/citation-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

interface IMountOptions {
    readonly form?: TestCitationForm;
    readonly mode?: FormMode;
    readonly status?: FormStatus;
    readonly watermark?: string;
}

/** Mounts the page collection over a real form and controllers, each page rendering its own id so a test can tell which is showing. */
async function mount(options: IMountOptions = {}) {
    const { mode = "editable", status } = options;
    let form = options.form ?? await createTestForm();

    if (status) {
        form = form.setStatus(status);
    }

    if (mode !== "editable") {
        form = form.setMode(mode);
    }

    const controllers: IControllerManager = new ControllerManager();
    controllers.loadForm(form);

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(FPageCollection, {
        controllers,
        watermark: options.watermark,
        groups: [{ pageDefinition: citationPage, children: binding => createElement("div", { className: "page-body", "data-page": binding.pageId }, `Content of ${binding.pageId}`) }]
    })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return {
        container,
        controllers,
        pageIds: () => controllers.getFormController().form.getPages().map(page => page.id!),
        showing: () => container.querySelector<HTMLElement>(".page-body")?.getAttribute("data-page"),
        tabs: () => Array.from(container.querySelectorAll(".nav-link")).map(tab => tab.textContent),
        tab: (title: string) => Array.from(container.querySelectorAll<HTMLElement>(".nav-link")).find(tab => tab.textContent === title)!
    };
}

/** Lets a page being added, which is asynchronous, finish. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
    });
}

beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
});

describe("FPageCollection", () => {
    describe("the tabs", () => {
        it("has a tab for each page, numbered from one", async () => {
            const form = await addCitationPage(await createTestForm());

            expect((await mount({ form })).tabs()).toEqual(["Page 1", "Page 2"]);
        });

        it("shows the first page to begin with", async () => {
            const { pageIds, showing } = await mount({ form: await addCitationPage(await createTestForm()) });

            expect(showing()).toBe(pageIds()[0]);
        });

        it("shows only the page whose tab was selected", async () => {
            const { container, pageIds, showing, tab } = await mount({ form: await addCitationPage(await createTestForm()) });

            act(() => tab("Page 2").click());

            expect(showing()).toBe(pageIds()[1]);
            expect(container.querySelectorAll(".page-body")).toHaveLength(1);
        });
    });

    describe("adding and deleting pages", () => {
        it("adds a page, and shows a tab for it, when the add page button is clicked", async () => {
            const { container, tabs } = await mount();

            act(() => Array.from(container.querySelectorAll<HTMLElement>(".btn-light")).find(candidate => candidate.textContent?.includes("Add Page"))!.click());
            await settle();

            expect(tabs()).toEqual(["Page 1", "Page 2"]);
        });

        it("deletes the page showing when the delete button is clicked", async () => {
            const { container, controllers, pageIds, showing, tabs } = await mount({ form: await addCitationPage(await createTestForm()) });
            const [first, second] = pageIds();
            controllers.getFormController().setConfirmDeletePage(async () => true);

            act(() => container.querySelector<HTMLElement>(".btn-danger")!.click());
            await settle();

            expect(pageIds()).toEqual([second]);
            expect(tabs()).toEqual(["Page 1"]);
            expect(showing()).toBe(second);
            expect(pageIds()).not.toContain(first);
        });

        it("offers neither once the form is no longer editable", async () => {
            const { container } = await mount({ mode: "viewable" });

            expect(container.querySelector(".btn-danger")).toBeNull();
            expect(container.textContent).not.toContain("Add Page");
        });

        it("offers both while the form is editable", async () => {
            const { container } = await mount();

            expect(container.querySelector(".btn-danger")).not.toBeNull();
            expect(container.textContent).toContain("Add Page");
        });
    });

    describe("the watermark", () => {
        it("carries none while the form is editable, whatever its status", async () => {
            expect((await mount({ status: "draft" })).container.querySelector(".f-watermark")).toBeNull();
        });

        it("stamps the status of a form that can no longer be edited across its pages", async () => {
            const { container } = await mount({ mode: "viewable", status: "voided" });

            expect(container.querySelector(".f-watermark")!.textContent).toBe("VOID");
        });

        it("stamps nothing for a status that is the document itself", async () => {
            expect((await mount({ mode: "viewable", status: "issued" })).container.querySelector(".f-watermark")).toBeNull();
        });

        it("stamps the watermark it is given instead, even on a form that is still editable", async () => {
            const { container } = await mount({ mode: "viewable", status: "voided", watermark: "COPY" });

            expect(container.querySelector(".f-watermark")!.textContent).toBe("COPY");
        });
    });

    describe("navigating", () => {
        it("shows the page a navigation names, and focuses the field on it", async () => {
            const { controllers, pageIds, showing } = await mount({ form: await addCitationPage(await createTestForm()) });
            const field = document.createElement("input");
            field.id = "field-to-find";
            field.focus = vi.fn();
            document.body.append(field);

            act(() => controllers.getNavigationController().goTo({ fieldId: "field-to-find", pageId: pageIds()[1] }));

            expect(showing()).toBe(pageIds()[1]);
            expect(field.focus).toHaveBeenCalledTimes(1);
            expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
        });

        it("keeps that page showing, and clears the navigation, once it has been acted on", async () => {
            const { controllers, pageIds, showing } = await mount({ form: await addCitationPage(await createTestForm()) });

            act(() => controllers.getNavigationController().goTo({ fieldId: "missing", pageId: pageIds()[1] }));

            expect(controllers.getNavigationController().target).toBeUndefined();
            expect(showing()).toBe(pageIds()[1]);
        });
    });

    describe("reporting the page showing", () => {
        it("says which page is showing, as it starts out and as another is selected", async () => {
            const { controllers, pageIds, tab } = await mount({ form: await addCitationPage(await createTestForm()) });
            const navigation = controllers.getNavigationController();

            expect(navigation.activePageId).toBe(pageIds()[0]);

            act(() => tab("Page 2").click());

            expect(navigation.activePageId).toBe(pageIds()[1]);
        });

        it("says no page is showing while the form is printing", async () => {
            const { controllers } = await mount();

            act(() => controllers.getPrintController().begin({ layout: "top-down" }));

            expect(controllers.getNavigationController().activePageId).toBeUndefined();
        });
    });

    describe("printing", () => {
        it("lays every page out flat, without tabs or the buttons that add and delete pages", async () => {
            const { container, controllers } = await mount({ form: await addCitationPage(await createTestForm()) });

            act(() => controllers.getPrintController().begin({ layout: "top-down" }));

            expect(container.querySelector(".f-print.f-print--top-down")).not.toBeNull();
            expect(container.querySelectorAll(".page-body")).toHaveLength(2);
            expect(container.querySelector(".nav-tabs")).toBeNull();
            expect(container.querySelector(".btn-danger")).toBeNull();
            expect(container.textContent).not.toContain("Add Page");
        });

        it("lays the pages out the way the print asks", async () => {
            const { container, controllers } = await mount();

            act(() => controllers.getPrintController().begin({ layout: "side-by-side" }));

            expect(container.querySelector(".f-print--side-by-side")).not.toBeNull();
        });

        it("prints only the pages the print names, by the name of their definition", async () => {
            const { container, controllers } = await mount({ form: await addCitationPage(await createTestForm()) });

            act(() => controllers.getPrintController().begin({ layout: "top-down", pageNames: ["citation"] }));
            expect(container.querySelectorAll(".page-body")).toHaveLength(2);

            act(() => controllers.getPrintController().begin({ layout: "top-down", pageNames: ["no-such-page"] }));
            expect(container.querySelectorAll(".page-body")).toHaveLength(0);
        });

        it("shrinks the pages by the scale the print measured, through a custom property", async () => {
            const { container, controllers } = await mount();

            act(() => controllers.getPrintController().begin({ layout: "top-down", scale: 0.5 }));

            expect(container.querySelector<HTMLElement>(".f-print")!.style.getPropertyValue("--f-print-scale")).toBe("0.5");
        });

        it("leaves the pages at their natural size when no scale was measured", async () => {
            const { container, controllers } = await mount();

            act(() => controllers.getPrintController().begin({ layout: "top-down" }));

            expect(container.querySelector<HTMLElement>(".f-print")!.style.getPropertyValue("--f-print-scale")).toBe("");
        });

        it("goes back to the tabs when the print ends", async () => {
            const { container, controllers } = await mount();

            act(() => controllers.getPrintController().begin({ layout: "top-down" }));
            act(() => controllers.getPrintController().end());

            expect(container.querySelector(".f-print")).toBeNull();
            expect(container.querySelector(".nav-tabs")).not.toBeNull();
        });
    });
});
