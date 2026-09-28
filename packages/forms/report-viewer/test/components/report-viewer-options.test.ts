// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager, FormMode, FormModel } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import { ReportViewerOptions } from "../../src/components/report-viewer-options";
import { IModalService, IReportViewerOption, IReportViewerService } from "../../src/services";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A form on the real form's prototype, so it is a form without a cast: the bar reads only its mode. */
function stubForm(mode: FormMode = "editable"): FormModel<any> {
    return Object.assign(Object.create(FormModel.prototype), {
        history: [],
        id: "form-1",
        mode,
        name: "Stub Form",
        status: "draft",
        type: "none",
        version: "1.0",
        extractData: () => ({ name: "Stub Form", status: "draft", type: "none", version: "1.0" }),
        getIsDirty: () => false,
        mapper: undefined
    });
}

/** An option whose component renders nothing but its own id, so a mount can be checked for which options showed up, and in what order. */
function stubOption(id: string): IReportViewerOption {
    return {
        id,
        title: id,
        Component: (): React.JSX.Element => createElement("span", { "data-testid": id }, id)
    };
}

const mounted: Array<() => void> = [];

function mount(options: ReadonlyArray<IReportViewerOption>): HTMLElement {
    const controllers = new ControllerManager();
    controllers.loadForm(stubForm());

    const reportViewerService = { getOptions: () => options } as unknown as IReportViewerService;
    const modalService = { showModal: vi.fn() } as unknown as IModalService;
    const registry = new Map<unknown, unknown>([[IReportViewerService, reportViewerService], [IModalService, modalService]]);
    const services = { get: (service: unknown) => registry.get(service) } as IServiceCollection;

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(
        ServicesContext.Provider,
        { value: services },
        createElement(ReportViewerOptions, { catalogItem: {} as never, controllers, onError: vi.fn() })
    )));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return container;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ReportViewerOptions", () => {
    it("renders every option the service offers, in the order it gives them", () => {
        const container = mount([stubOption("a"), stubOption("b")]);

        const ids = Array.from(container.querySelectorAll("[data-testid]")).map(element => element.getAttribute("data-testid"));
        expect(ids).toEqual(["a", "b"]);
    });

    it("renders nothing when the service offers no options", () => {
        const container = mount([]);

        expect(container.querySelector("#report-viewer-options")!.children).toHaveLength(0);
    });

    it("floats at the bottom left, stacked in a column", () => {
        const bar = mount([stubOption("a")]).querySelector("#report-viewer-options")!;

        expect(bar.className).toContain("flex-column");
        expect(bar.className).toContain("position-fixed");
        expect(bar.className).toContain("bottom-0");
        expect(bar.className).toContain("start-0");
        expect(bar.className).not.toContain("end-0");
    });

    it("spaces every option but the first apart vertically, not horizontally", () => {
        const container = mount([stubOption("a"), stubOption("b"), stubOption("c")]);
        const items = container.querySelectorAll("#report-viewer-options > div");

        expect(items[0].className).toBe("");
        expect(items[1].className).toBe("mt-2");
        expect(items[2].className).toBe("mt-2");
        expect(Array.from(items).some(item => item.className.includes("ms-"))).toBe(false);
    });
});
