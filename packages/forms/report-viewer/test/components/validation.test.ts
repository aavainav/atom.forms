import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IRuleIssue, RuleIssueSeverity } from "@forms/core";

import Validation from "../../src/components/validation/validation";
import { controllersFor, issue, IStubPage } from "../fixtures/validation-issues";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const record: IStubPage = { ids: ["record-1"], title: "Record Page" };
const front: IStubPage = { ids: ["front-1", "front-2"], title: "Front Page" };

const firstName = issue({ field: { id: "f1", label: "First Name", name: "first-name" }, message: "Person First Name is required", page: record, pageId: "record-1", section: "Person Section" });
const lastName = issue({ field: { id: "f2", label: "Last Name", name: "last-name" }, message: "Person Last Name is required", page: record, pageId: "record-1", section: "Person Section" });
const routeType = issue({ field: { id: "f3", label: "RT. Type", name: "route-type" }, message: "Route Category is required", page: record, pageId: "record-1", section: "Route Section" });
const unusual = issue({ field: { id: "f4", label: "RT. # / Name", name: "route-number" }, message: "Route number looks unusual", page: record, pageId: "record-1", section: "Route Section", severity: RuleIssueSeverity.warning });

const mounted: Array<() => void> = [];

function mount(issues: ReadonlyArray<IRuleIssue>, pages: ReadonlyArray<IStubPage> = [record], onClose = vi.fn()) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(Validation, { controllers: controllersFor(pages), issues, isOpen: true, onClose })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return container;
}

/** The headings and the labels of the rows under them, in the order they are listed. */
function listed(container: HTMLElement): Array<string> {
    return Array.from(container.querySelectorAll(".list-group-item")).map(row => (row.querySelector(".fw-semibold") ?? row).textContent!.trim());
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("Validation", () => {
    it("is titled Validation, since it lists warnings as well as errors", () => {
        expect(mount([firstName]).querySelector("h5")!.textContent).toBe("Validation");
    });

    it("groups the issues under one heading per page and section, in the order they were raised, with a count", () => {
        const container = mount([firstName, routeType, lastName, unusual]);

        expect(container.querySelectorAll(".list-group")).toHaveLength(2);
        expect(listed(container)).toEqual([
            "Record Page · Person Section (2)", "First Name", "Last Name",
            "Record Page · Route Section (2)", "RT. Type", "RT. # / Name"
        ]);
    });

    it("numbers a page that repeats, so each copy's issues are told apart", () => {
        const charge = (pageId: string) => issue({ field: { id: pageId, label: "Description", name: "description" }, message: "Description is required", page: front, pageId, section: "Violation Section" });

        expect(listed(mount([charge("front-1"), charge("front-2")], [front]))).toEqual([
            "Front Page 1 · Violation Section (1)", "Description",
            "Front Page 2 · Violation Section (1)", "Description"
        ]);
    });

    /** A shared section holds the same on every copy, and its rules run once, so its issue is on all of them, not the first. */
    it("does not number a page for a section it shares across its copies", () => {
        const name = issue({ field: { id: "n", label: "First Name", name: "first-name" }, message: "Name is required", page: front, pageId: "front-1", section: "Violator Section", shared: true });

        expect(listed(mount([name], [front]))).toEqual(["Front Page · Violator Section (1)", "First Name"]);
    });

    it("counts the issues of each severity under the header", () => {
        expect(mount([firstName, lastName, unusual]).querySelector("#validation-summary")!.textContent).toBe("2 errors · 1 warning");
    });

    it("leaves a severity with no issues out of the count, and says one in the singular", () => {
        expect(mount([firstName]).querySelector("#validation-summary")!.textContent).toBe("1 error");
        expect(mount([unusual]).querySelector("#validation-summary")!.textContent).toBe("1 warning");
    });

    /** Taking the form to a field leaves the list up, so the next issue is a click away. */
    it("stays open when an entry is clicked", () => {
        const onClose = vi.fn();
        const container = mount([firstName, lastName], [record], onClose);

        act(() => container.querySelector<HTMLElement>(".list-group-item-action")!.click());

        expect(onClose).not.toHaveBeenCalled();
    });

    it("says there are no issues when there are none", () => {
        const container = mount([]);

        expect(container.textContent).toContain("No validation issues found.");
        expect(container.querySelector("#validation-summary")).toBeNull();
    });
});
