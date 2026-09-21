import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { FormModel, IModalOptions } from "@forms/core";
import type { IServiceCollection } from "@shrub/core";

import { ReportDataOption } from "../../src/components/options/report-data-option";
import type { IReportDataTab } from "../../src/components/options/report-data-dialog";
import { IModalService } from "../../src/services/modal";
import { INotificationService } from "../../src/services/notification";
import { IReportViewerService } from "../../src/services/report-viewer";
import type { IReportBundle } from "../../src/services/report-viewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const bundle: IReportBundle = {
    audit: [{ at: 1, form: { id: "form-1", name: "Stub Form", version: "1.0" }, id: "a-1", kind: "saved" }],
    comments: [{ at: 1, author: { id: "9", name: "Lt. Osei" }, id: "c-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." }],
    data: { name: "Stub Form", status: "draft", type: "none", version: "1.0" },
    exportedAt: 2,
    version: 1
};

const mounted: Array<() => void> = [];

function mount() {
    const controllers = new ControllerManager();
    const form = { id: "form-1" } as unknown as FormModel<any>;
    controllers.loadForm(form);

    const getBundle = vi.fn(() => bundle);
    const showModal = vi.fn();
    const showNotification = vi.fn();
    const registry = new Map<unknown, unknown>([
        [IModalService, { showModal }],
        [INotificationService, { showNotification }],
        [IReportViewerService, { getBundle }]
    ]);
    const services = { get: (service: unknown) => registry.get(service) } as unknown as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ReportDataOption, { catalogItem: {} as never, controllers, onError: vi.fn(), showModal: vi.fn(), title: "View report data" }))));
    mounted.push(() => act(() => root.unmount()));

    act(() => container.querySelector<HTMLElement>("#report-data-button")!.click());

    const options = showModal.mock.calls[0][0] as IModalOptions;

    return { form, getBundle, options, showNotification, tabs: options.contentProps!.tabs as ReadonlyArray<IReportDataTab>, controllers };
}

const writeText = vi.fn();

beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ReportDataOption", () => {
    it("gathers the bundle for the form as it is when the option is clicked", () => {
        const { controllers, form, getBundle } = mount();

        expect(getBundle).toHaveBeenCalledWith(form, controllers);
    });

    it("opens a dialog with a tab for the report data, the audit history and the comments", () => {
        const { options, tabs } = mount();

        expect(options.title).toBe("Report data");
        expect(options.size).toBe("xl");
        expect(tabs.map(tab => tab.title)).toEqual(["Report data", "Audit history", "Comments"]);
    });

    it("formats each tab's data as indented json", () => {
        const { tabs } = mount();

        expect(tabs[0].json).toBe(JSON.stringify(bundle.data, null, 2));
        expect(tabs[1].json).toBe(JSON.stringify(bundle.audit, null, 2));
        expect(tabs[2].json).toBe(JSON.stringify(bundle.comments, null, 2));
    });

    describe("copy", () => {
        const copyAction = (options: IModalOptions) => options.actions!.find(action => action.title === "Copy")!;

        it("copies the tab the dialog opened on, and leaves the dialog open", async () => {
            const { options, showNotification, tabs } = mount();

            const result = await copyAction(options).invoke();

            expect(writeText).toHaveBeenCalledWith(tabs[0].json);
            expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Report data copied." });
            expect(result).toEqual({ result: false });
        });

        it("copies whichever tab the dialog last reported", async () => {
            const { options, showNotification, tabs } = mount();

            (options.contentProps!.onChange as (tab: IReportDataTab) => void)(tabs[2]);
            await copyAction(options).invoke();

            expect(writeText).toHaveBeenCalledWith(tabs[2].json);
            expect(showNotification).toHaveBeenCalledWith({ type: "success", message: "Comments copied." });
        });

        it("says so when the browser refuses the copy", async () => {
            writeText.mockRejectedValue(new Error("Denied."));
            const { options, showNotification } = mount();

            await copyAction(options).invoke();

            expect(showNotification).toHaveBeenCalledWith({ type: "danger", message: "Denied." });
        });
    });

    it("closes from its close action and its header", async () => {
        const { options } = mount();

        expect(await options.actions!.find(action => action.title === "Close")!.invoke()).toEqual({ result: true });
        expect(await options.close!.invoke()).toEqual({ result: true });
    });
});
