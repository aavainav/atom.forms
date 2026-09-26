import { describe, expect, it } from "vitest";

import { IReportData } from "@forms/core";

import { getPageLists, getSavableGroups, toPresetData } from "../../src/utils/savable-groups";

/** A report as it stands: its identity, and whatever else has been answered. */
function report(answers: Record<string, unknown> = {}): IReportData {
    return { id: "report-1", name: "Stub Form", revision: 3, status: "draft", type: "none", version: "1.0", ...answers };
}

const pair = (value: string, description: string) => ({ description, value });

describe("getSavableGroups", () => {
    it("groups the report's own single fields together", () => {
        const groups = getSavableGroups(report({ agencyCity: "Columbia", agencyName: "Columbia PD" }), undefined);

        expect(groups).toEqual([{ fields: [{ key: "agencyCity", value: "Columbia" }, { key: "agencyName", value: "Columbia PD" }] }]);
    });

    it("leaves out the report's own identity, which is not something a preset sets", () => {
        const keys = getSavableGroups(report({ agencyCity: "Columbia", workflow: { history: [], id: "w", version: "1" } }), undefined).flatMap(group => group.fields.map(field => field.key));

        expect(keys).toEqual(["agencyCity"]);
    });

    it("leaves out what is not answered", () => {
        const keys = getSavableGroups(report({ agencyCity: "Columbia", agencyName: "", isCommercial: false, notes: undefined, tags: [] }), undefined).flatMap(group => group.fields.map(field => field.key));

        expect(keys).toEqual(["agencyCity"]);
    });

    it("leaves out an option box with nothing chosen and a number left alone, which a report holds as a blank pair and a zero", () => {
        const keys = getSavableGroups(report({ agencyCity: "Columbia", vehicleMake: pair("", ""), vehicleYear: 0 }), undefined).flatMap(group => group.fields.map(field => field.key));

        expect(keys).toEqual(["agencyCity"]);
    });

    it("offers an option box as one field, showing its pair", () => {
        const groups = getSavableGroups(report({ vehicleMake: pair("TOYT", "TOYOTA") }), undefined);

        expect(groups[0].fields).toEqual([{ key: "vehicleMake", value: pair("TOYT", "TOYOTA") }]);
    });

    it("leaves out what the host locked", () => {
        const groups = getSavableGroups(report({ agencyCity: "Columbia", agencyName: "Columbia PD" }), { agencyName: true } as never);

        expect(groups[0].fields.map(field => field.key)).toEqual(["agencyCity"]);
    });

    it("gives each page of a list a group of its own, named by the list and its position", () => {
        const groups = getSavableGroups(report({ persons: [{ first: "Dana" }, { first: "Riley", last: "Okafor" }] }), undefined);

        expect(groups).toEqual([
            { fields: [{ key: "first", value: "Dana" }], index: 0, list: "persons" },
            { fields: [{ key: "first", value: "Riley" }, { key: "last", value: "Okafor" }], index: 1, list: "persons" }
        ]);
    });

    it("lists the report's own fields before its pages", () => {
        const groups = getSavableGroups(report({ persons: [{ first: "Dana" }], agencyCity: "Columbia" }), undefined);

        expect(groups.map(group => group.list)).toEqual([undefined, "persons"]);
    });

    it("leaves out a page with nothing answered, though its place in the list still counts", () => {
        const groups = getSavableGroups(report({ persons: [{}, { first: "Riley" }] }), undefined);

        expect(groups).toEqual([{ fields: [{ key: "first", value: "Riley" }], index: 1, list: "persons" }]);
    });

    it("leaves out what the host locked on a page, by the page's position", () => {
        const groups = getSavableGroups(report({ persons: [{ first: "Dana", last: "Okafor" }, { first: "Riley" }] }), { persons: [{ first: true }, {}] } as never);

        expect(groups).toEqual([
            { fields: [{ key: "last", value: "Okafor" }], index: 0, list: "persons" },
            { fields: [{ key: "first", value: "Riley" }], index: 1, list: "persons" }
        ]);
    });

    it("leaves out every page of a list the host locked as a whole, and a page it locked as a whole", () => {
        expect(getSavableGroups(report({ persons: [{ first: "Dana" }] }), { persons: true } as never)).toEqual([]);
        expect(getSavableGroups(report({ persons: [{ first: "Dana" }, { first: "Riley" }] }), { persons: [true, {}] } as never).map(group => group.index)).toEqual([1]);
    });

    it("offers no group for a report with nothing to save", () => {
        expect(getSavableGroups(report(), undefined)).toEqual([]);
    });

    it("does not offer a record nested in a page, which is not a single field", () => {
        const groups = getSavableGroups(report({ persons: [{ first: "Dana", address: { city: "Columbia" } }] }), undefined);

        expect(groups[0].fields.map(field => field.key)).toEqual(["first"]);
    });
});

describe("getPageLists", () => {
    it("names each list of pages the report has, and how many pages it holds", () => {
        expect(getPageLists(report({ persons: [{}, {}], units: [{}] }))).toEqual([{ count: 2, list: "persons" }, { count: 1, list: "units" }]);
    });

    it("counts a page with nothing on it", () => {
        expect(getPageLists(report({ units: [{}, {}, {}] }))).toEqual([{ count: 3, list: "units" }]);
    });

    it("is empty for a report with no list of pages, and a list of plain values is not one", () => {
        expect(getPageLists(report({ agencyCity: "Columbia", tags: ["a", "b"] }))).toEqual([]);
    });
});

describe("toPresetData", () => {
    const current = report({
        agencyCity: "Columbia",
        agencyName: "Columbia PD",
        persons: [{ first: "Dana", last: "Okafor" }, { first: "Riley", type: pair("3", "NON-MOTORIST") }],
        units: [{ number: "1" }, { number: "2" }]
    });

    it("takes the report's own fields that were ticked, with the values they hold", () => {
        expect(toPresetData(current, new Set(["agencyName"]), new Set())).toEqual({ agencyName: "Columbia PD" });
    });

    it("takes a page's field by its path, and keeps the page's place with an empty record for each page before it", () => {
        expect(toPresetData(current, new Set(["persons[1].type"]), new Set())).toEqual({ persons: [{}, { type: pair("3", "NON-MOTORIST") }] });
    });

    it("gathers the fields ticked on one page, and on several pages, into one list", () => {
        const data = toPresetData(current, new Set(["persons[0].first", "persons[1].first", "units[1].number"]), new Set());

        expect(data).toEqual({ persons: [{ first: "Dana" }, { first: "Riley" }], units: [{}, { number: "2" }] });
    });

    it("keeps the number of pages of a list, as blank pages, when told to", () => {
        expect(toPresetData(current, new Set(), new Set(["units"]))).toEqual({ units: [{}, {}] });
    });

    it("keeps the number of pages beyond the pages that were ticked", () => {
        expect(toPresetData(current, new Set(["units[0].number"]), new Set(["units"]))).toEqual({ units: [{ number: "1" }, {}] });
    });

    it("keeps the pages a list already holds when the ticked ones are past them", () => {
        expect(toPresetData(current, new Set(["units[0].number"]), new Set(["persons"]))).toEqual({ units: [{ number: "1" }], persons: [{}, {}] });
    });

    it("takes nothing of what was not ticked", () => {
        const data = toPresetData(current, new Set(["agencyCity"]), new Set());

        expect(Object.keys(data)).toEqual(["agencyCity"]);
    });

    it("gives nothing for nothing ticked", () => {
        expect(toPresetData(current, new Set(), new Set())).toEqual({});
    });

    it("does not change the report it reads", () => {
        const before = JSON.stringify(current);

        toPresetData(current, new Set(["persons[1].first"]), new Set(["units"]));

        expect(JSON.stringify(current)).toBe(before);
    });
});
