import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { IServiceCollection } from "@shrub/core";

import { ReportViewer } from "../../src/components/report-viewer";
import { IReportViewerDataManager, IReportViewerService } from "../../src/services/report-viewer";

// the form it renders once loaded is the report viewer form's own business, and is tested there
vi.mock("../../src/components/report-viewer-form", () => ({ ReportViewerForm: () => null }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const identity = { name: "Stub Form", version: "1.0" };
const dataManager: IReportViewerDataManager = { read: async () => undefined };

const mounted: Array<() => void> = [];

/** Mounts the report viewer over a service that loads nothing in particular, and gives back what it was asked to load. */
async function mount(template?: string) {
    const loadForm = vi.fn(async () => ({}));
    const registry = new Map<unknown, unknown>([[IReportViewerService, { loadForm }]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;
    const root = createRoot(document.createElement("div"));

    await act(async () => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ReportViewer, { dataManager, identity, template }))));
    mounted.push(() => act(() => root.unmount()));

    return { loadForm };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ReportViewer", () => {
    it("opens the report the host holds when it is given no template", async () => {
        const { loadForm } = await mount();

        expect(loadForm).toHaveBeenCalledTimes(1);
        expect(loadForm).toHaveBeenCalledWith(identity, dataManager, "open", undefined);
    });

    it("starts a new report from the template it is given, in place of opening one", async () => {
        const { loadForm } = await mount("speeding");

        expect(loadForm).toHaveBeenCalledTimes(1);
        expect(loadForm).toHaveBeenCalledWith(identity, dataManager, "new", "speeding");
    });
});
