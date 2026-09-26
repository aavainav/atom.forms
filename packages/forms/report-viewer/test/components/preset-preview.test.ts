import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { PresetPreview } from "../../src/components/panel/preset-preview";
import { IPresetPlan } from "../../src/services/preset";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** A plan as the service hands it over, whose fields are the ones its groups hold. */
function mount({ groups = [], pages = [], skipped = [] }: Partial<Pick<IPresetPlan, "groups" | "pages" | "skipped">>): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);
    const plan: IPresetPlan = { data: {}, fields: groups.flatMap(group => group.fields), groups, pages, skipped };

    act(() => root.render(createElement(PresetPreview, { plan })));
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
        expect(listed(mount({ groups: [{ fields: ["agencyCity", "agencyName"] }] }))).toEqual(["Will set (2)", "agencyCity", "agencyName"]);
    });

    it("lists the fields under the group it is given, in the order it is given them, each headed by the group's title", () => {
        const container = mount({
            groups: [
                { fields: ["agencyCity"] },
                { fields: ["persons[1].first", "persons[1].last"], title: "Persons, page 2" },
                { fields: ["units[0].number"], title: "Units, page 1" }
            ]
        });

        expect(listed(container)).toEqual([
            "Will set (1)", "agencyCity",
            "Will set: Persons, page 2 (2)", "persons[1].first", "persons[1].last",
            "Will set: Units, page 1 (1)", "units[0].number"
        ]);
    });

    it("says which pages it would add, and how many, by the name it is given the list", () => {
        expect(listed(mount({ pages: [{ added: 1, label: "Units", list: "units" }, { added: 2, label: "Persons", list: "persons" }] }))).toEqual(["Adds", "1 Units page", "2 Persons pages"]);
    });

    it("lists what it would leave alone, with why", () => {
        const container = mount({ skipped: [{ field: "agencyName", reason: "locked" }, { field: "agencyCity", reason: "answered" }] });

        expect(listed(container)).toEqual(["Left alone (2)", "agencyName Locked", "agencyCity Answered"]);
    });

    it("puts what it adds first, then what it sets, then what it leaves alone", () => {
        const container = mount({ groups: [{ fields: ["agencyCity"] }], pages: [{ added: 1, label: "Units", list: "units" }], skipped: [{ field: "agencyName", reason: "locked" }] });

        expect(listed(container)).toEqual(["Adds", "1 Units page", "Will set (1)", "agencyCity", "Left alone (1)", "agencyName Locked"]);
    });

    it("has no heading for what there is none of", () => {
        expect(listed(mount({ skipped: [{ field: "agencyName", reason: "locked" }] }))).toEqual(["Left alone (1)", "agencyName Locked"]);
    });

    it("shows what it is given and does no spelling of its own, so a label the service chose is the label shown", () => {
        const container = mount({ groups: [{ fields: ["units[0].number"], title: "Vehicles, page 1" }], pages: [{ added: 1, label: "Vehicles", list: "units" }] });

        expect(listed(container)).toEqual(["Adds", "1 Vehicles page", "Will set: Vehicles, page 1 (1)", "units[0].number"]);
    });
});
