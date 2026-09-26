import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { PresetPreview } from "../../src/components/panel/preset-preview";
import { IPresetPlan } from "../../src/utils/plan-preset";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

function mount(plan: Partial<IPresetPlan>): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(PresetPreview, { plan: { data: {}, fields: [], pages: [], skipped: [], ...plan } })));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

/** The text of the rows and headings, in the order they are listed. */
function listed(container: HTMLElement): Array<string> {
    return Array.from(container.querySelectorAll(".list-group-item")).map(row => (row.textContent ?? "").replace(/\s+/g, " ").trim());
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("PresetPreview", () => {
    it("says there is nothing to apply when the preset would do nothing and leave nothing alone", () => {
        const container = mount({});

        expect(container.querySelector("#preset-preview-empty")!.textContent).toContain("Nothing to apply");
        expect(container.querySelector("#preset-preview")).toBeNull();
    });

    it("lists the report's own fields it would set, under a heading that counts them", () => {
        expect(listed(mount({ fields: ["agencyCity", "agencyName"] }))).toEqual(["Will set (2)", "agencyCity", "agencyName"]);
    });

    it("lists the fields on a page under that page, after the report's own", () => {
        const container = mount({ fields: ["persons[1].first", "agencyCity", "persons[1].last", "units[0].number"] });

        expect(listed(container)).toEqual([
            "Will set (1)", "agencyCity",
            "Will set: Persons, page 2 (2)", "persons[1].first", "persons[1].last",
            "Will set: Units, page 1 (1)", "units[0].number"
        ]);
    });

    it("says which pages it would add, and how many", () => {
        expect(listed(mount({ pages: [{ added: 1, list: "units" }, { added: 2, list: "persons" }] }))).toEqual(["Adds", "1 Units page", "2 Persons pages"]);
    });

    it("lists what it would leave alone, with why", () => {
        const container = mount({ skipped: [{ field: "agencyName", reason: "locked" }, { field: "agencyCity", reason: "answered" }] });

        expect(listed(container)).toEqual(["Left alone (2)", "agencyName Locked", "agencyCity Answered"]);
    });

    it("puts what it adds first, then what it sets, then what it leaves alone", () => {
        const container = mount({ fields: ["agencyCity"], pages: [{ added: 1, list: "units" }], skipped: [{ field: "agencyName", reason: "locked" }] });

        expect(listed(container)).toEqual(["Adds", "1 Units page", "Will set (1)", "agencyCity", "Left alone (1)", "agencyName Locked"]);
    });

    it("has no heading for what there is none of", () => {
        expect(listed(mount({ skipped: [{ field: "agencyName", reason: "locked" }] }))).toEqual(["Left alone (1)", "agencyName Locked"]);
    });
});
