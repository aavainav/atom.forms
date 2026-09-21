import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReportDataDialog } from "../../src/components/options/report-data-dialog";
import type { IReportDataTab } from "../../src/components/options/report-data-dialog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const tabs: ReadonlyArray<IReportDataTab> = [
    { id: "data", title: "Report data", json: "{ \"name\": \"Dana\" }" },
    { id: "audit", title: "Audit history", json: "[ \"opened\" ]" },
    { id: "comments", title: "Comments", json: "[ \"wrong date\" ]" }
];

const mounted: Array<() => void> = [];

function mount(onChange: (tab: IReportDataTab) => void = () => undefined): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ReportDataDialog, { tabs, onChange })));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

function tab(container: HTMLElement, title: string): HTMLElement {
    return Array.from(container.querySelectorAll<HTMLElement>(".nav-link")).find(link => link.textContent === title)!;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ReportDataDialog", () => {
    it("lists a tab for each kind of data, in order", () => {
        const container = mount();

        expect(Array.from(container.querySelectorAll(".nav-link")).map(link => link.textContent)).toEqual(["Report data", "Audit history", "Comments"]);
    });

    it("shows the first tab's data to begin with, and only that", () => {
        const container = mount();

        expect(container.querySelector("pre")!.textContent).toBe("{ \"name\": \"Dana\" }");
        expect(container.textContent).not.toContain("wrong date");
        expect(container.textContent).not.toContain("opened");
    });

    it("shows the data of the tab selected, and says which tab it was", () => {
        const onChange = vi.fn();
        const container = mount(onChange);

        act(() => tab(container, "Audit history").click());

        expect(container.querySelector("pre")!.textContent).toBe("[ \"opened\" ]");
        expect(onChange).toHaveBeenCalledWith(tabs[1]);
    });

    it("shows the data as a code panel", () => {
        expect(mount().querySelector("pre.f-code code")).not.toBeNull();
    });
});
