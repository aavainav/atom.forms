import { describe, expect, it } from "vitest";

import { IReportData } from "@forms/core";

import { planPreset } from "../../src/utils/plan-preset";
import { IReportPreset } from "../../src/services/report-viewer";

/** A report as it stands: its identity, and whatever else has been answered. */
function report(answers: Record<string, unknown> = {}): IReportData {
    return { name: "Stub Form", status: "draft", type: "none", version: "1.0", ...answers };
}

/** A preset that sets what it is given, and locks what it says to. */
function preset(data: Record<string, unknown>, readOnlyFields?: object): IReportPreset {
    return { data, id: "preset-1", readOnlyFields: readOnlyFields as never, title: "Preset" };
}

const pair = (value: string, description: string) => ({ description, value });

describe("planPreset", () => {
    describe("a field the report has not answered", () => {
        it("is written, and named", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia" }), report(), undefined, false);

            expect(plan.data).toEqual({ agencyCity: "Columbia" });
            expect(plan.fields).toEqual(["agencyCity"]);
            expect(plan.skipped).toEqual([]);
        });

        it.each([["blank text", ""], ["nothing", undefined], ["an unchecked box", false], ["a list of nothing", []]])("is one holding %s", (_, held) => {
            expect(planPreset(preset({ agencyCity: "Columbia" }), report({ agencyCity: held }), undefined, false).fields).toEqual(["agencyCity"]);
        });
    });

    describe("a field the report has answered", () => {
        it("is left alone, and said to be answered, unless told to overwrite", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Charleston" }), undefined, false);

            expect(plan.data).toEqual({});
            expect(plan.fields).toEqual([]);
            expect(plan.skipped).toEqual([{ field: "agencyCity", reason: "answered" }]);
        });

        it("is written over when told to overwrite", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Charleston" }), undefined, true);

            expect(plan.data).toEqual({ agencyCity: "Columbia" });
            expect(plan.skipped).toEqual([]);
        });

        it("does not count a zero as an answer, since a number left alone reports one", () => {
            const plan = planPreset(preset({ vehicleYear: 2020 }), report({ vehicleYear: 0 }), undefined, false);

            expect(plan.fields).toEqual(["vehicleYear"]);
            expect(plan.skipped).toEqual([]);
        });

        it("does not count an option box with nothing chosen as an answer, which it reports as a blank pair", () => {
            const plan = planPreset(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report({ vehicleMake: pair("", "") }), undefined, false);

            expect(plan.data).toEqual({ vehicleMake: pair("TOYT", "TOYOTA") });
            expect(plan.skipped).toEqual([]);
        });

        it("is neither written nor said to be skipped when it already holds what the preset sets", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Columbia" }), undefined, false);

            expect(plan.fields).toEqual([]);
            expect(plan.skipped).toEqual([]);
        });
    });

    describe("a field the host locked", () => {
        const locked = { agencyName: true } as never;

        it("is never written, though the report has not answered it, and is said to be locked", () => {
            const plan = planPreset(preset({ agencyName: "Columbia PD" }), report(), locked, false);

            expect(plan.data).toEqual({});
            expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
        });

        it("is never written, even when told to overwrite", () => {
            const plan = planPreset(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Charleston PD" }), locked, true);

            expect(plan.fields).toEqual([]);
            expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
        });

        it("is said to be locked, not answered, when it is both", () => {
            expect(planPreset(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Charleston PD" }), locked, false).skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
        });

        it("leaves the fields beside it to be written", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia", agencyName: "Columbia PD" }), report(), locked, false);

            expect(plan.data).toEqual({ agencyCity: "Columbia" });
            expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
        });

        it("is neither written nor said to be skipped when it already holds what the preset sets", () => {
            const plan = planPreset(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Columbia PD" }), locked, false);

            expect(plan.skipped).toEqual([]);
        });
    });

    describe("an option box", () => {
        it("is one field, named as itself and not by its two parts", () => {
            const plan = planPreset(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report({ vehicleMake: pair("HOND", "HONDA") }), undefined, false);

            expect(plan.skipped).toEqual([{ field: "vehicleMake", reason: "answered" }]);
        });

        it("is written whole when the report has not answered it", () => {
            const plan = planPreset(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report(), undefined, false);

            expect(plan.data).toEqual({ vehicleMake: pair("TOYT", "TOYOTA") });
            expect(plan.fields).toEqual(["vehicleMake"]);
        });

        it("is left alone when it is locked as a whole", () => {
            const plan = planPreset(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report(), { vehicleMake: true } as never, false);

            expect(plan.skipped).toEqual([{ field: "vehicleMake", reason: "locked" }]);
        });
    });

    describe("a list of pages", () => {
        it("pairs each page with the report's by position, naming a field by its page", () => {
            const plan = planPreset(
                preset({ persons: [{ first: "B", last: "C" }, { first: "D" }] }),
                report({ persons: [{ first: "A" }] }),
                undefined,
                false);

            expect(plan.data).toEqual({ persons: [{ last: "C" }, { first: "D" }] });
            expect(plan.fields).toEqual(["persons[0].last", "persons[1].first"]);
            expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "answered" }]);
        });

        it("says how many pages it would add to the list", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }, { first: "D" }, { first: "E" }] }), report({ persons: [{}] }), undefined, false);

            expect(plan.pages).toEqual([{ added: 2, list: "persons" }]);
        });

        it("adds no pages when the report has as many as the preset", () => {
            expect(planPreset(preset({ persons: [{ first: "B" }] }), report({ persons: [{}] }), undefined, false).pages).toEqual([]);
        });

        it("keeps the place of a page with nothing to write, as an empty record", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }, { first: "D" }] }), report({ persons: [{ first: "A" }, {}] }), undefined, false);

            expect(plan.data).toEqual({ persons: [{}, { first: "D" }] });
        });

        it("is left out altogether when there is nothing to write and no page to add", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }] }), report({ persons: [{ first: "A" }] }), undefined, false);

            expect(plan.data).toEqual({});
        });

        it("is kept when it only adds pages, though it sets no field", () => {
            const plan = planPreset(preset({ units: [{}, {}] }), report({ units: [{}] }), undefined, false);

            expect(plan.data).toEqual({ units: [{}, {}] });
            expect(plan.fields).toEqual([]);
            expect(plan.pages).toEqual([{ added: 1, list: "units" }]);
        });

        it("adds pages to a list the report has not got at all", () => {
            const plan = planPreset(preset({ units: [{ number: "1" }] }), report(), undefined, false);

            expect(plan.pages).toEqual([{ added: 1, list: "units" }]);
            expect(plan.fields).toEqual(["units[0].number"]);
        });

        it("names an option box on a page as the field it is", () => {
            const plan = planPreset(preset({ persons: [{}, { type: pair("3", "NON-MOTORIST") }] }), report({ persons: [{}, { type: pair("1", "MV DRIVER") }] }), undefined, false);

            expect(plan.skipped).toEqual([{ field: "persons[1].type", reason: "answered" }]);
        });

        it("leaves a page's field alone when the host locked it, by the page's position", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }, { first: "D" }] }), report(), { persons: [{ first: true }, {}] } as never, false);

            expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "locked" }]);
            expect(plan.fields).toEqual(["persons[1].first"]);
        });

        it("leaves every field on every page alone when the host locked the whole list", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }, { first: "D" }] }), report(), { persons: true } as never, false);

            expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "locked" }, { field: "persons[1].first", reason: "locked" }]);
            expect(plan.fields).toEqual([]);
        });
    });

    describe("the locks the preset carries", () => {
        it("are cut down to the fields it writes, so only a lock actually applied is remembered", () => {
            const plan = planPreset(preset({ agencyCity: "Columbia", agencyName: "Columbia PD" }, { agencyName: true }), report(), undefined, false);

            expect(plan.readOnlyFields).toEqual({ agencyName: true });
        });

        it("are dropped for a field the report already answers, which the preset leaves alone", () => {
            const plan = planPreset(preset({ agencyName: "Columbia PD" }, { agencyName: true }), report({ agencyName: "Charleston PD" }), undefined, false);

            expect(plan.readOnlyFields).toBeUndefined();
        });

        it("are absent when the preset carries none", () => {
            expect(planPreset(preset({ agencyCity: "Columbia" }), report(), undefined, false).readOnlyFields).toBeUndefined();
        });

        it("are kept by page, for the pages that are written", () => {
            const plan = planPreset(preset({ persons: [{ first: "B" }, { first: "D" }] }, { persons: [{}, { first: true }] }), report({ persons: [{ first: "A" }] }), undefined, false);

            expect(plan.readOnlyFields).toEqual({ persons: [undefined, { first: true }] });
        });
    });

    it("leaves the preset it was given as it was", () => {
        const given = preset({ persons: [{ first: "B" }], agencyCity: "Columbia" });
        const before = JSON.stringify(given);

        planPreset(given, report({ agencyCity: "Charleston", persons: [{ first: "A" }] }), undefined, false);

        expect(JSON.stringify(given)).toBe(before);
    });

    it("does nothing for a preset that sets nothing", () => {
        const plan = planPreset(preset({}), report({ agencyCity: "Columbia" }), undefined, false);

        expect(plan).toEqual({ data: {}, fields: [], pages: [], readOnlyFields: undefined, skipped: [] });
    });
});
