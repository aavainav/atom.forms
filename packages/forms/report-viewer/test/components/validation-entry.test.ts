import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ControllerManager, IRuleIssue, RuleIssueSeverity } from "@forms/core";

import { ValidationErrorEntry } from "../../src/components/validation/validation-entry";
import { controllersFor, issue, IStubPage } from "../fixtures/validation-issues";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const record: IStubPage = { ids: ["record-1"], title: "Record Page" };
const firstName = issue({ field: { id: "f1", label: "First Name", name: "first-name" }, message: "Person First Name is required", page: record, pageId: "record-1", section: "Person Section" });

const mounted: Array<() => void> = [];

function mount(raised: IRuleIssue, controllers: ControllerManager = controllersFor([record])) {
    const goTo = vi.spyOn(controllers.getNavigationController(), "goTo");
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ValidationErrorEntry, { controllers, issue: raised })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { goTo, row: container.querySelector<HTMLElement>(".list-group-item")! };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("ValidationErrorEntry", () => {
    it("shows the field's label, and the rule's full message beneath it, each kept to one line", () => {
        const { row } = mount(firstName);

        expect(row.querySelector(".fw-semibold")!.textContent).toBe("First Name");
        expect(row.querySelector("small")!.textContent).toBe("Person First Name is required");
        expect(row.querySelector(".text-truncate")).not.toBeNull();
    });

    it("spells the field's name out as its label when it has none of its own", () => {
        const { row } = mount(issue({ field: { label: "", name: "latitude-degrees" }, message: "Latitude is required", page: record, pageId: "record-1", section: "Person Section" }));

        expect(row.querySelector(".fw-semibold")!.textContent).toBe("Latitude Degrees");
    });

    it("says the severity by its icon", () => {
        const warning = issue({ field: { label: "RT. # / Name", name: "route-number" }, message: "Route number looks unusual", page: record, pageId: "record-1", section: "Route Section", severity: RuleIssueSeverity.warning });

        expect(mount(firstName).row.innerHTML).toContain("exclamation-circle");
        expect(mount(warning).row.innerHTML).toContain("exclamation-triangle");
    });

    it("takes the form to the field's page and focuses it when clicked", () => {
        const { goTo, row } = mount(firstName);

        act(() => row.click());

        expect(goTo).toHaveBeenCalledWith({ pageId: "record-1", fieldId: "f1" });
    });

    it("can be reached and pressed from the keyboard", () => {
        const { goTo, row } = mount(firstName);

        act(() => { row.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })); });

        expect(row.tabIndex).toBe(0);
        expect(goTo).toHaveBeenCalledWith({ pageId: "record-1", fieldId: "f1" });
    });
});
