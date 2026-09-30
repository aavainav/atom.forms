import { afterEach, describe, expect, it, vi } from "vitest";

import { getAuditController } from "@forms/audit";
import { ControllerManager, FormModel, IReportData } from "@forms/core";

import { IReportPreset, IReportViewerDataManager } from "../../src/services/report-viewer";
import { ISaveRequest, PresetService } from "../../src/services/preset";
import { blankFields, identity, populated, stubForm, variantForm } from "../fixtures/preset-form";

/** A report as it stands: its identity, every field the stub form has, and whatever of them has been answered. */
function report(answers: Record<string, unknown> = {}): IReportData {
    return { id: "report-1", name: "Stub Form", revision: 3, status: "draft", type: "none", version: "1.0", ...blankFields, ...answers };
}

/** A preset that sets what it is given, and locks what it says to. */
function preset(data: Record<string, unknown>, readOnlyFields?: object): IReportPreset {
    return { data, id: "preset-1", readOnlyFields: readOnlyFields as never, title: "Preset" };
}

const pair = (value: string, description: string) => ({ description, value });

describe("PresetService", () => {
    const service = new PresetService();

    describe("isAnswered", () => {
        it("is true for text, a number, a checked box and a list with something in it", () => {
            expect(service.isAnswered("Columbia")).toBe(true);
            expect(service.isAnswered(14)).toBe(true);
            expect(service.isAnswered(true)).toBe(true);
            expect(service.isAnswered(["W", "B"])).toBe(true);
        });

        it("is false for nothing typed, and for text that is blank", () => {
            expect(service.isAnswered(undefined)).toBe(false);
            expect(service.isAnswered(null)).toBe(false);
            expect(service.isAnswered("")).toBe(false);
        });

        it("is false for an unchecked box, since a box left alone and a box unchecked cannot be told apart", () => {
            expect(service.isAnswered(false)).toBe(false);
        });

        it("is false for a zero, since a number left alone reports one", () => {
            expect(service.isAnswered(0)).toBe(false);
        });

        it("is false for a list of nothing", () => {
            expect(service.isAnswered([])).toBe(false);
        });

        describe("an option box", () => {
            it("is answered when it has a choice", () => {
                expect(service.isAnswered({ description: "AUTOMOBILE", value: "01" })).toBe(true);
            });

            it("is not answered when nothing is chosen, which it reports as a blank pair", () => {
                expect(service.isAnswered({ description: "", value: "" })).toBe(false);
            });

            it("is not answered when its value is blank, whatever its description says", () => {
                expect(service.isAnswered({ description: "NONE", value: "" })).toBe(false);
            });
        });

        it("is true for an object that is not an option box", () => {
            expect(service.isAnswered({ city: "Columbia" })).toBe(true);
        });
    });

    describe("humanize", () => {
        it("spells a key out in words, each beginning with a capital", () => {
            expect(service.humanize("personHeaderPersonType")).toBe("Person Header Person Type");
        });

        it("gives a single word a capital", () => {
            expect(service.humanize("persons")).toBe("Persons");
        });

        it("leaves a key that is already spelled out as it is", () => {
            expect(service.humanize("Units")).toBe("Units");
        });

        it("gives an empty key back empty", () => {
            expect(service.humanize("")).toBe("");
        });
    });

    describe("plan", () => {
        describe("a field the report has not answered", () => {
            it("is written, and named", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia" }), report(), undefined, false);

                expect(plan.data).toEqual({ agencyCity: "Columbia" });
                expect(plan.fields).toEqual(["agencyCity"]);
                expect(plan.skipped).toEqual([]);
            });

            it.each([["blank text", ""], ["nothing", undefined], ["an unchecked box", false], ["a list of nothing", []]])("is one holding %s", (_, held) => {
                expect(service.plan(preset({ agencyCity: "Columbia" }), report({ agencyCity: held }), undefined, false).fields).toEqual(["agencyCity"]);
            });
        });

        describe("a field the report does not carry", () => {
            /** A form reports every field it has, so one missing is a field it does not have, such as the other copy's on S438. */
            it("is left out, neither written nor said to be skipped, as one the form does not have", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia", trialCourtName: "Columbia Municipal Court" }), report(), undefined, false);

                expect(plan.data).toEqual({ agencyCity: "Columbia" });
                expect(plan.fields).toEqual(["agencyCity"]);
                expect(plan.skipped).toEqual([]);
            });

            it("drops its lock with it", () => {
                expect(service.plan(preset({ trialCourtName: "Columbia Municipal Court" }, { trialCourtName: true }), report(), undefined, false).readOnlyFields).toBeUndefined();
            });
        });

        describe("a field the report has answered", () => {
            it("is left alone, and said to be answered, unless told to overwrite", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Charleston" }), undefined, false);

                expect(plan.data).toEqual({});
                expect(plan.fields).toEqual([]);
                expect(plan.skipped).toEqual([{ field: "agencyCity", reason: "answered" }]);
            });

            it("is written over when told to overwrite", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Charleston" }), undefined, true);

                expect(plan.data).toEqual({ agencyCity: "Columbia" });
                expect(plan.skipped).toEqual([]);
            });

            it("does not count a zero as an answer, since a number left alone reports one", () => {
                const plan = service.plan(preset({ vehicleYear: 2020 }), report({ vehicleYear: 0 }), undefined, false);

                expect(plan.fields).toEqual(["vehicleYear"]);
                expect(plan.skipped).toEqual([]);
            });

            it("does not count an option box with nothing chosen as an answer, which it reports as a blank pair", () => {
                const plan = service.plan(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report({ vehicleMake: pair("", "") }), undefined, false);

                expect(plan.data).toEqual({ vehicleMake: pair("TOYT", "TOYOTA") });
                expect(plan.skipped).toEqual([]);
            });

            it("is neither written nor said to be skipped when it already holds what the preset sets", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Columbia" }), undefined, false);

                expect(plan.fields).toEqual([]);
                expect(plan.skipped).toEqual([]);
            });
        });

        describe("a field the host locked", () => {
            const locked = { agencyName: true } as never;

            it("is never written, though the report has not answered it, and is said to be locked", () => {
                const plan = service.plan(preset({ agencyName: "Columbia PD" }), report(), locked, false);

                expect(plan.data).toEqual({});
                expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
            });

            it("is never written, even when told to overwrite", () => {
                const plan = service.plan(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Charleston PD" }), locked, true);

                expect(plan.fields).toEqual([]);
                expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
            });

            it("is said to be locked, not answered, when it is both", () => {
                expect(service.plan(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Charleston PD" }), locked, false).skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
            });

            it("leaves the fields beside it to be written", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia", agencyName: "Columbia PD" }), report(), locked, false);

                expect(plan.data).toEqual({ agencyCity: "Columbia" });
                expect(plan.skipped).toEqual([{ field: "agencyName", reason: "locked" }]);
            });

            it("is neither written nor said to be skipped when it already holds what the preset sets", () => {
                const plan = service.plan(preset({ agencyName: "Columbia PD" }), report({ agencyName: "Columbia PD" }), locked, false);

                expect(plan.skipped).toEqual([]);
            });
        });

        describe("an option box", () => {
            it("is one field, named as itself and not by its two parts", () => {
                const plan = service.plan(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report({ vehicleMake: pair("HOND", "HONDA") }), undefined, false);

                expect(plan.skipped).toEqual([{ field: "vehicleMake", reason: "answered" }]);
            });

            it("is written whole when the report has not answered it", () => {
                const plan = service.plan(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report(), undefined, false);

                expect(plan.data).toEqual({ vehicleMake: pair("TOYT", "TOYOTA") });
                expect(plan.fields).toEqual(["vehicleMake"]);
            });

            it("is left alone when it is locked as a whole", () => {
                const plan = service.plan(preset({ vehicleMake: pair("TOYT", "TOYOTA") }), report(), { vehicleMake: true } as never, false);

                expect(plan.skipped).toEqual([{ field: "vehicleMake", reason: "locked" }]);
            });
        });

        describe("a list of pages", () => {
            it("pairs each page with the report's by position, naming a field by its page", () => {
                const plan = service.plan(
                    preset({ persons: [{ first: "B", last: "C" }, { first: "D" }] }),
                    report({ persons: [{ first: "A" }] }),
                    undefined,
                    false);

                expect(plan.data).toEqual({ persons: [{ last: "C" }, { first: "D" }] });
                expect(plan.fields).toEqual(["persons[0].last", "persons[1].first"]);
                expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "answered" }]);
            });

            it("says how many pages it would add to the list", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }, { first: "D" }, { first: "E" }] }), report({ persons: [{}] }), undefined, false);

                expect(plan.pages).toEqual([{ added: 2, label: "Persons", list: "persons" }]);
            });

            it("adds no pages when the report has as many as the preset", () => {
                expect(service.plan(preset({ persons: [{ first: "B" }] }), report({ persons: [{}] }), undefined, false).pages).toEqual([]);
            });

            it("keeps the place of a page with nothing to write, as an empty record", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }, { first: "D" }] }), report({ persons: [{ first: "A" }, {}] }), undefined, false);

                expect(plan.data).toEqual({ persons: [{}, { first: "D" }] });
            });

            it("is left out altogether when there is nothing to write and no page to add", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }] }), report({ persons: [{ first: "A" }] }), undefined, false);

                expect(plan.data).toEqual({});
            });

            it("is kept when it only adds pages, though it sets no field", () => {
                const plan = service.plan(preset({ units: [{}, {}] }), report({ units: [{}] }), undefined, false);

                expect(plan.data).toEqual({ units: [{}, {}] });
                expect(plan.fields).toEqual([]);
                expect(plan.pages).toEqual([{ added: 1, label: "Units", list: "units" }]);
            });

            it("adds pages to a list the report has not got at all", () => {
                const plan = service.plan(preset({ units: [{ number: "1" }] }), report(), undefined, false);

                expect(plan.pages).toEqual([{ added: 1, label: "Units", list: "units" }]);
                expect(plan.fields).toEqual(["units[0].number"]);
            });

            it("names an option box on a page as the field it is", () => {
                const plan = service.plan(preset({ persons: [{}, { type: pair("3", "NON-MOTORIST") }] }), report({ persons: [{}, { type: pair("1", "MV DRIVER") }] }), undefined, false);

                expect(plan.skipped).toEqual([{ field: "persons[1].type", reason: "answered" }]);
            });

            it("leaves a page's field alone when the host locked it, by the page's position", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }, { first: "D" }] }), report(), { persons: [{ first: true }, {}] } as never, false);

                expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "locked" }]);
                expect(plan.fields).toEqual(["persons[1].first"]);
            });

            it("leaves every field on every page alone when the host locked the whole list", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }, { first: "D" }] }), report(), { persons: true } as never, false);

                expect(plan.skipped).toEqual([{ field: "persons[0].first", reason: "locked" }, { field: "persons[1].first", reason: "locked" }]);
                expect(plan.fields).toEqual([]);
            });
        });

        describe("the locks the preset carries", () => {
            it("are cut down to the fields it writes, so only a lock actually applied is remembered", () => {
                const plan = service.plan(preset({ agencyCity: "Columbia", agencyName: "Columbia PD" }, { agencyName: true }), report(), undefined, false);

                expect(plan.readOnlyFields).toEqual({ agencyName: true });
            });

            it("are dropped for a field the report already answers, which the preset leaves alone", () => {
                const plan = service.plan(preset({ agencyName: "Columbia PD" }, { agencyName: true }), report({ agencyName: "Charleston PD" }), undefined, false);

                expect(plan.readOnlyFields).toBeUndefined();
            });

            it("are absent when the preset carries none", () => {
                expect(service.plan(preset({ agencyCity: "Columbia" }), report(), undefined, false).readOnlyFields).toBeUndefined();
            });

            it("are kept by page, for the pages that are written", () => {
                const plan = service.plan(preset({ persons: [{ first: "B" }, { first: "D" }] }, { persons: [{}, { first: true }] }), report({ persons: [{ first: "A" }] }), undefined, false);

                expect(plan.readOnlyFields).toEqual({ persons: [undefined, { first: true }] });
            });
        });

        it("leaves the preset it was given as it was", () => {
            const given = preset({ persons: [{ first: "B" }], agencyCity: "Columbia" });
            const before = JSON.stringify(given);

            service.plan(given, report({ agencyCity: "Charleston", persons: [{ first: "A" }] }), undefined, false);

            expect(JSON.stringify(given)).toBe(before);
        });

        it("does nothing for a preset that sets nothing", () => {
            const plan = service.plan(preset({}), report({ agencyCity: "Columbia" }), undefined, false);

            expect(plan).toEqual({ data: {}, fields: [], groups: [], pages: [], readOnlyFields: undefined, skipped: [] });
        });
    });

    describe("fitsVariant", () => {
        const forTrial = preset({ agencyCity: "Columbia" });

        it("fits every preset to a form with no variants", () => {
            expect(service.fitsVariant({ ...forTrial, variants: ["trial"] }, stubForm())).toBe(true);
        });

        it("fits a preset naming the variant the form is in, and not one naming only another", () => {
            expect(service.fitsVariant({ ...forTrial, variants: ["trial"] }, variantForm("trial"))).toBe(true);
            expect(service.fitsVariant({ ...forTrial, variants: ["court", "trial"] }, variantForm("trial"))).toBe(true);
            expect(service.fitsVariant({ ...forTrial, variants: ["trial"] }, variantForm("court"))).toBe(false);
        });

        /** A host serving presets it never tagged gets the form's default, as a record naming no variant opens as it. */
        it("takes a preset naming no variant to be for the form's default", () => {
            expect(service.fitsVariant(forTrial, variantForm("court"))).toBe(true);
            expect(service.fitsVariant(forTrial, variantForm("trial"))).toBe(false);
        });
    });

    describe("getSavableGroups", () => {
        it("groups the report's own single fields together", () => {
            const groups = service.getSavableGroups(report({ agencyCity: "Columbia", agencyName: "Columbia PD" }), undefined);

            expect(groups).toEqual([{
                fields: [{ key: "agencyCity", label: "Agency City", path: "agencyCity", value: "Columbia" }, { key: "agencyName", label: "Agency Name", path: "agencyName", value: "Columbia PD" }],
                title: "The report"
            }]);
        });

        it("leaves out the report's own identity, which is not something a preset sets", () => {
            const keys = service.getSavableGroups(report({ agencyCity: "Columbia", variant: "trial", workflow: { history: [], id: "w", version: "1" } }), undefined).flatMap(group => group.fields.map(field => field.key));

            expect(keys).toEqual(["agencyCity"]);
        });

        it("leaves out what is not answered", () => {
            const keys = service.getSavableGroups(report({ agencyCity: "Columbia", agencyName: "", isCommercial: false, notes: undefined, tags: [] }), undefined).flatMap(group => group.fields.map(field => field.key));

            expect(keys).toEqual(["agencyCity"]);
        });

        it("leaves out an option box with nothing chosen and a number left alone, which a report holds as a blank pair and a zero", () => {
            const keys = service.getSavableGroups(report({ agencyCity: "Columbia", vehicleMake: pair("", ""), vehicleYear: 0 }), undefined).flatMap(group => group.fields.map(field => field.key));

            expect(keys).toEqual(["agencyCity"]);
        });

        it("offers an option box as one field, showing its pair", () => {
            const groups = service.getSavableGroups(report({ vehicleMake: pair("TOYT", "TOYOTA") }), undefined);

            expect(groups[0].fields).toEqual([{ key: "vehicleMake", label: "Vehicle Make", path: "vehicleMake", value: pair("TOYT", "TOYOTA") }]);
        });

        it("leaves out what the host locked", () => {
            const groups = service.getSavableGroups(report({ agencyCity: "Columbia", agencyName: "Columbia PD" }), { agencyName: true } as never);

            expect(groups[0].fields.map(field => field.key)).toEqual(["agencyCity"]);
        });

        it("gives each page of a list a group of its own, named by the list and its position", () => {
            const groups = service.getSavableGroups(report({ persons: [{ first: "Dana" }, { first: "Riley", last: "Okafor" }] }), undefined);

            expect(groups).toEqual([
                { fields: [{ key: "first", label: "First", path: "persons[0].first", value: "Dana" }], index: 0, list: "persons", title: "Persons, page 1" },
                { fields: [{ key: "first", label: "First", path: "persons[1].first", value: "Riley" }, { key: "last", label: "Last", path: "persons[1].last", value: "Okafor" }], index: 1, list: "persons", title: "Persons, page 2" }
            ]);
        });

        it("lists the report's own fields before its pages", () => {
            const groups = service.getSavableGroups(report({ persons: [{ first: "Dana" }], agencyCity: "Columbia" }), undefined);

            expect(groups.map(group => group.list)).toEqual([undefined, "persons"]);
        });

        it("leaves out a page with nothing answered, though its place in the list still counts", () => {
            const groups = service.getSavableGroups(report({ persons: [{}, { first: "Riley" }] }), undefined);

            expect(groups).toEqual([{ fields: [{ key: "first", label: "First", path: "persons[1].first", value: "Riley" }], index: 1, list: "persons", title: "Persons, page 2" }]);
        });

        it("leaves out what the host locked on a page, by the page's position", () => {
            const groups = service.getSavableGroups(report({ persons: [{ first: "Dana", last: "Okafor" }, { first: "Riley" }] }), { persons: [{ first: true }, {}] } as never);

            expect(groups).toEqual([
                { fields: [{ key: "last", label: "Last", path: "persons[0].last", value: "Okafor" }], index: 0, list: "persons", title: "Persons, page 1" },
                { fields: [{ key: "first", label: "First", path: "persons[1].first", value: "Riley" }], index: 1, list: "persons", title: "Persons, page 2" }
            ]);
        });

        it("leaves out every page of a list the host locked as a whole, and a page it locked as a whole", () => {
            expect(service.getSavableGroups(report({ persons: [{ first: "Dana" }] }), { persons: true } as never)).toEqual([]);
            expect(service.getSavableGroups(report({ persons: [{ first: "Dana" }, { first: "Riley" }] }), { persons: [true, {}] } as never).map(group => group.index)).toEqual([1]);
        });

        it("offers no group for a report with nothing to save", () => {
            expect(service.getSavableGroups(report(), undefined)).toEqual([]);
        });

        it("does not offer a record nested in a page, which is not a single field", () => {
            const groups = service.getSavableGroups(report({ persons: [{ first: "Dana", address: { city: "Columbia" } }] }), undefined);

            expect(groups[0].fields.map(field => field.key)).toEqual(["first"]);
        });
    });

    describe("getPageLists", () => {
        it("names each list of pages the report has, and how many pages it holds", () => {
            expect(service.getPageLists(report({ persons: [{}, {}], units: [{}] }))).toEqual([{ count: 2, label: "Persons", list: "persons" }, { count: 1, label: "Units", list: "units" }]);
        });

        it("counts a page with nothing on it", () => {
            expect(service.getPageLists(report({ units: [{}, {}, {}] }))).toEqual([{ count: 3, label: "Units", list: "units" }]);
        });

        it("is empty for a report with no list of pages, and a list of plain values is not one", () => {
            expect(service.getPageLists(report({ agencyCity: "Columbia", tags: ["a", "b"] }))).toEqual([]);
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
            expect(service.toPresetData(current, new Set(["agencyName"]), new Set())).toEqual({ agencyName: "Columbia PD" });
        });

        it("takes a page's field by its path, and keeps the page's place with an empty record for each page before it", () => {
            expect(service.toPresetData(current, new Set(["persons[1].type"]), new Set())).toEqual({ persons: [{}, { type: pair("3", "NON-MOTORIST") }] });
        });

        it("gathers the fields ticked on one page, and on several pages, into one list", () => {
            const data = service.toPresetData(current, new Set(["persons[0].first", "persons[1].first", "units[1].number"]), new Set());

            expect(data).toEqual({ persons: [{ first: "Dana" }, { first: "Riley" }], units: [{}, { number: "2" }] });
        });

        it("keeps the number of pages of a list, as blank pages, when told to", () => {
            expect(service.toPresetData(current, new Set(), new Set(["units"]))).toEqual({ units: [{}, {}] });
        });

        it("keeps the number of pages beyond the pages that were ticked", () => {
            expect(service.toPresetData(current, new Set(["units[0].number"]), new Set(["units"]))).toEqual({ units: [{ number: "1" }, {}] });
        });

        it("keeps the pages a list already holds when the ticked ones are past them", () => {
            expect(service.toPresetData(current, new Set(["units[0].number"]), new Set(["persons"]))).toEqual({ units: [{ number: "1" }], persons: [{}, {}] });
        });

        it("takes nothing of what was not ticked", () => {
            const data = service.toPresetData(current, new Set(["agencyCity"]), new Set());

            expect(Object.keys(data)).toEqual(["agencyCity"]);
        });

        it("gives nothing for nothing ticked", () => {
            expect(service.toPresetData(current, new Set(), new Set())).toEqual({});
        });

        it("does not change the report it reads", () => {
            const before = JSON.stringify(current);

            service.toPresetData(current, new Set(["persons[1].first"]), new Set(["units"]));

            expect(JSON.stringify(current)).toBe(before);
        });
    });
    describe("plan: what it says of where the fields sit", () => {
        it("sorts the fields it sets under the page they are on, the report's own first, each page titled for the officer", () => {
            const plan = service.plan(
                preset({ persons: [{ firstName: "A" }, { firstName: "B", lastName: "C" }], agencyCity: "Columbia", units: [{ number: "1" }] }),
                report(),
                undefined,
                false);

            expect(plan.groups).toEqual([
                { fields: ["agencyCity"], title: undefined },
                { fields: ["persons[0].firstName"], title: "Persons, page 1" },
                { fields: ["persons[1].firstName", "persons[1].lastName"], title: "Persons, page 2" },
                { fields: ["units[0].number"], title: "Units, page 1" }
            ]);
        });

        it("has the same fields as it sets, whichever way they are read", () => {
            const plan = service.plan(preset({ agencyCity: "Columbia", persons: [{ first: "A" }] }), report(), undefined, false);

            expect(plan.groups.flatMap(group => group.fields)).toEqual(plan.fields);
        });

        it("has a group only for the fields it sets, not for what it leaves alone", () => {
            const plan = service.plan(preset({ agencyCity: "Columbia", persons: [{ first: "A" }] }), report({ agencyCity: "Charleston" }), undefined, false);

            expect(plan.groups).toEqual([{ fields: ["persons[0].first"], title: "Persons, page 1" }]);
        });

        it("has no group when it sets nothing", () => {
            expect(service.plan(preset({ agencyCity: "Columbia" }), report({ agencyCity: "Columbia" }), undefined, false).groups).toEqual([]);
        });
    });

    describe("a service that changes a rule", () => {
        /** Counts a zero as an answer, as a host whose numbers are never left alone might. */
        class ZeroIsAnswered extends PresetService {
            override isAnswered(value: unknown): boolean {
                return value === 0 || super.isAnswered(value);
            }
        }

        /** Spells a key in capitals, as a host with labels of its own might. */
        class Shouting extends PresetService {
            override humanize(key: string): string {
                return key.toUpperCase();
            }
        }

        it("plans by what it counts as answered", () => {
            const plan = new ZeroIsAnswered().plan(preset({ vehicleYear: 2020 }), report({ vehicleYear: 0 }), undefined, false);

            expect(plan.fields).toEqual([]);
            expect(plan.skipped).toEqual([{ field: "vehicleYear", reason: "answered" }]);
        });

        it("offers what it counts as answered, for saving", () => {
            const keys = (service: PresetService) => service.getSavableGroups(report({ vehicleYear: 0 }), undefined).flatMap(group => group.fields.map(field => field.key));

            expect(keys(new PresetService())).toEqual([]);
            expect(keys(new ZeroIsAnswered())).toEqual(["vehicleYear"]);
        });

        it("titles and labels with how it spells a key, wherever the officer reads one", () => {
            const changed = new Shouting();
            const held = report({ agencyCity: "Columbia", persons: [{ first: "Dana" }] });

            const groups = changed.getSavableGroups(held, undefined);
            expect(groups.map(group => group.title)).toEqual(["The report", "PERSONS, page 1"]);
            expect(groups[0].fields[0].label).toBe("AGENCYCITY");
            expect(changed.getPageLists(held)[0].label).toBe("PERSONS");

            const plan = changed.plan(preset({ persons: [{ first: "A" }, { first: "B" }] }), report({ persons: [{}] }), undefined, false);
            expect(plan.pages[0].label).toBe("PERSONS");
            expect(plan.groups.map(group => group.title)).toEqual(["PERSONS, page 1", "PERSONS, page 2"]);
        });
    });
    describe("the actions", () => {
        /** A report held by real controllers, with the real audit watching it. */
        function open(answers: Record<string, unknown> = {}, readOnlyFields?: Record<string, unknown>, form: FormModel<any> = stubForm(answers, readOnlyFields)) {
            const controllers = new ControllerManager();
            controllers.loadForm(form);

            return {
                controllers,
                form$: (): FormModel<any> => controllers.getFormController().form,
                kinds: (): Array<string> => getAuditController(controllers).session.map(record => record.kind),
                records: () => getAuditController(controllers).session
            };
        }

        const columbia = { data: { agencyCity: "Columbia", agencyName: "Columbia PD" }, id: "columbia-pd", readOnlyFields: { agencyName: true }, title: "Columbia PD" } as IReportPreset;

        afterEach(() => populated.mockClear());

        describe("apply", () => {
            it("changes and records nothing when every field the preset sets is one the form does not have", async () => {
                const { controllers, kinds } = open();
                const other = { data: { trialCourtName: "Columbia Municipal Court" }, id: "other-copy", title: "Other copy" } as IReportPreset;

                const plan = await service.apply(controllers, other, false);

                expect(plan.fields).toEqual([]);
                expect(populated).not.toHaveBeenCalled();
                expect(kinds()).toEqual(["form-opened"]);
            });

            it("refuses a preset for another variant of the form, and changes and records nothing", async () => {
                const { controllers, kinds } = open(undefined, undefined, variantForm("court"));

                await expect(service.apply(controllers, { ...columbia, variants: ["trial"] }, false)).rejects.toThrow("\"Columbia PD\" is not for this version of the form.");
                expect(populated).not.toHaveBeenCalled();
                expect(kinds()).toEqual(["form-opened"]);
            });

            it("writes what the preset sets into the report, with the report's own identity", async () => {
                const { controllers, form$ } = open();

                await service.apply(controllers, columbia, false);

                expect(form$().extractData()).toMatchObject({ agencyCity: "Columbia", agencyName: "Columbia PD" });
                expect(populated).toHaveBeenCalledWith(expect.objectContaining({ data: { agencyCity: "Columbia", agencyName: "Columbia PD", ...identity } }));
            });

            it("answers with the plan it applied", async () => {
                const { controllers } = open({ agencyCity: "Charleston" });

                const plan = await service.apply(controllers, columbia, false);

                expect(plan.fields).toEqual(["agencyName"]);
                expect(plan.skipped).toEqual([{ field: "agencyCity", reason: "answered" }]);
            });

            it("applies the lock the preset carries, for what it wrote", async () => {
                const { controllers, form$ } = open();

                await service.apply(controllers, columbia, false);

                expect(populated).toHaveBeenCalledWith(expect.objectContaining({ readOnlyFields: { agencyName: true } }));
                expect(form$().readOnlyFields).toEqual({ agencyName: true });
            });

            it("does not lock what it did not write", async () => {
                const { controllers } = open({ agencyName: "Charleston PD" });

                await service.apply(controllers, columbia, false);

                expect(populated).toHaveBeenCalledWith(expect.objectContaining({ readOnlyFields: undefined }));
            });

            it("leaves what the report answers alone by default, and writes over it when told to overwrite", async () => {
                const kept = open({ agencyCity: "Charleston" });
                await service.apply(kept.controllers, columbia, false);
                expect(kept.form$().extractData()).toMatchObject({ agencyCity: "Charleston", agencyName: "Columbia PD" });

                const over = open({ agencyCity: "Charleston" });
                await service.apply(over.controllers, columbia, true);
                expect(over.form$().extractData()).toMatchObject({ agencyCity: "Columbia" });
            });

            it("never writes what the host locked, even when told to overwrite", async () => {
                const { controllers, form$ } = open({ agencyName: "Charleston PD" }, { agencyName: true });

                await service.apply(controllers, columbia, true);

                expect(form$().extractData()).toMatchObject({ agencyName: "Charleston PD", agencyCity: "Columbia" });
                expect(populated).toHaveBeenCalledWith(expect.objectContaining({ data: { agencyCity: "Columbia", ...identity } }));
            });

            it("asks for the pages a preset adds, by giving the whole list", async () => {
                const { controllers } = open({ units: [{}] });

                await service.apply(controllers, { data: { units: [{}, {}] }, id: "two-units", title: "Two units" } as IReportPreset, false);

                expect(populated).toHaveBeenCalledWith(expect.objectContaining({ data: { units: [{}, {}], ...identity } }));
            });

            it("makes one change to the report, so it is one step to undo", async () => {
                const { controllers } = open();
                const changed = vi.fn();
                controllers.getFormController().onChanged(changed);

                await service.apply(controllers, columbia, false);

                expect(changed).toHaveBeenCalledTimes(1);
            });

            it("changes nothing, asks the form for nothing and records nothing when the preset would do nothing", async () => {
                const held = stubForm({ agencyCity: "Columbia", agencyName: "Columbia PD" });
                const { controllers, form$, kinds } = open({}, undefined, held);

                const plan = await service.apply(controllers, columbia, false);

                expect(plan.fields).toEqual([]);
                expect(populated).not.toHaveBeenCalled();
                expect(form$()).toBe(held);
                expect(kinds()).toEqual(["form-opened"]);
            });

            it("changes nothing and records nothing when the preset only leaves fields alone", async () => {
                const held = stubForm({ agencyCity: "Charleston", agencyName: "Charleston PD" });
                const { controllers, form$, kinds } = open({}, undefined, held);

                const plan = await service.apply(controllers, columbia, false);

                expect(plan.skipped).toHaveLength(2);
                expect(form$()).toBe(held);
                expect(kinds()).toEqual(["form-opened"]);
            });

            describe("what the audit says", () => {
                it("records the preset applied, with the fields it changed and never what they held, and each field it left alone after it, with why", async () => {
                    const { controllers, records } = open({ agencyName: "Charleston PD" }, { agencyName: true });

                    await service.apply(controllers, columbia, false);

                    expect(records().map(record => record.kind)).toEqual(["form-opened", "preset-applied", "preset-skipped"]);
                    expect(records()[1]).toMatchObject({ preset: "columbia-pd", fields: ["agencyCity"] });
                    expect(records()[2]).toMatchObject({ preset: "columbia-pd", field: "agencyName", reason: "locked" });
                    expect(JSON.stringify(records())).not.toContain("Columbia");
                });

                it("records each field left alone as a record of its own, with why", async () => {
                    const wide = { data: { agencyCity: "Columbia", agencyName: "Columbia PD", agencyPhone: "803-555-0100" }, id: "wide", title: "Wide" } as IReportPreset;
                    const { controllers, records } = open({ agencyCity: "Charleston", agencyName: "Charleston PD" });

                    await service.apply(controllers, wide, false);

                    const skipped = records().filter(record => record.kind === "preset-skipped");
                    expect(skipped).toMatchObject([
                        { preset: "wide", field: "agencyCity", reason: "answered" },
                        { preset: "wide", field: "agencyName", reason: "answered" }
                    ]);
                    expect(new Set(skipped.map(record => record.id)).size).toBe(2);
                });

                it("says nothing was skipped when every field was written", async () => {
                    const { controllers, kinds } = open();

                    await service.apply(controllers, columbia, false);

                    expect(kinds()).toEqual(["form-opened", "preset-applied"]);
                });
            });

            describe("when it goes wrong", () => {
                it("rejects with what went wrong, and changes and records nothing, when populating fails", async () => {
                    const failing = stubForm({}, undefined, async () => { throw new Error("Pages of units cannot be added while they are locked."); });
                    const { controllers, form$, kinds } = open({}, undefined, failing);

                    await expect(service.apply(controllers, columbia, false)).rejects.toThrow("Pages of units cannot be added while they are locked.");

                    expect(form$()).toBe(failing);
                    expect(kinds()).toEqual(["form-opened"]);
                });

                it("rejects, and applies and records nothing, when the report changed while populating was awaited", async () => {
                    let release: () => void = () => undefined;
                    const slow = stubForm({}, undefined, () => new Promise(resolve => { release = () => resolve(stubForm({ agencyCity: "Columbia" })); }));
                    const { controllers, form$, kinds } = open({}, undefined, slow);
                    const edited = stubForm({ notes: "typed while it waited" });

                    const pending = service.apply(controllers, columbia, false);
                    controllers.getFormController().setForm(edited);
                    release();

                    await expect(pending).rejects.toThrow("The report changed while the preset was being applied. Apply it again.");
                    expect(form$()).toBe(edited);
                    expect(kinds()).not.toContain("preset-applied");
                });
            });
        });

        describe("save", () => {
            const answers = { agencyCity: "Columbia", persons: [{ first: "Dana" }, { first: "Riley", type: "3" }] };
            const request = (selected: Array<string>, pageCounts: Array<string> = [], title = "Rileys page"): ISaveRequest => ({ pageCounts: new Set(pageCounts), selected: new Set(selected), title });

            /** A host that keeps what it is given. */
            function host(writePreset: (preset: IReportPreset) => Promise<void> = async () => undefined): IReportViewerDataManager<any> {
                return { read: async () => undefined, writePreset: vi.fn(writePreset) };
            }

            it("hands the host a preset of the user's own, with what was ticked kept by position, and answers with it", async () => {
                const { controllers } = open(answers);
                const manager = host();

                const saved = await service.save(controllers, manager, request(["persons[1].first"]));

                expect(manager.writePreset).toHaveBeenCalledTimes(1);
                expect(manager.writePreset).toHaveBeenCalledWith({ data: { persons: [{}, { first: "Riley" }] }, id: expect.any(String), isPersonal: true, title: "Rileys page" });
                expect(saved).toBe(vi.mocked(manager.writePreset!).mock.calls[0][0]);
            });

            it("stamps a preset with the variant it was saved from, since it holds only that variant's fields", async () => {
                const { controllers } = open(undefined, undefined, variantForm("trial", answers));

                expect((await service.save(controllers, host(), request(["agencyCity"]))).variants).toEqual(["trial"]);
            });

            it("names no variant on a preset saved from a form with none", async () => {
                const { controllers } = open(answers);

                expect(await service.save(controllers, host(), request(["agencyCity"]))).not.toHaveProperty("variants");
            });

            it("gives each preset an id of its own", async () => {
                const { controllers } = open(answers);

                const first = await service.save(controllers, host(), request(["agencyCity"]));
                const second = await service.save(controllers, host(), request(["agencyCity"]));

                expect(first.id).not.toBe(second.id);
            });

            it("keeps what the report holds when it is saved, not what it held before", async () => {
                const { controllers } = open(answers);
                controllers.getFormController().setForm(stubForm({ agencyCity: "Charleston" }));

                const saved = await service.save(controllers, host(), request(["agencyCity"]));

                expect(saved.data).toEqual({ agencyCity: "Charleston" });
            });

            it("records that it was saved, naming what it was saved from and never what they held", async () => {
                const { controllers, records } = open(answers);

                await service.save(controllers, host(), request(["persons[1].first"], ["persons"]));

                const saved = records().find(record => record.kind === "preset-saved");
                expect(saved).toMatchObject({ fields: ["persons[1].first", "persons"] });
                expect(JSON.stringify(saved)).not.toContain("Riley");
            });

            it("rejects with the host's reason, and records nothing, when the host refuses", async () => {
                const { controllers, kinds } = open(answers);
                const refusing = host(async () => { throw new Error("Presets may not hold a person's name."); });

                await expect(service.save(controllers, refusing, request(["persons[1].first"]))).rejects.toThrow("Presets may not hold a person's name.");

                expect(kinds()).not.toContain("preset-saved");
            });

            it("rejects, and records nothing, when the host cannot keep presets", async () => {
                const { controllers, kinds } = open(answers);

                await expect(service.save(controllers, { read: async () => undefined }, request(["agencyCity"]))).rejects.toThrow("The host cannot keep presets.");

                expect(kinds()).not.toContain("preset-saved");
            });
        });

        describe("remove", () => {
            it("has the host delete the preset, and records that it did", async () => {
                const { controllers, records } = open();
                const deletePreset = vi.fn(async () => undefined);

                await service.remove(controllers, { deletePreset, read: async () => undefined }, "mine");

                expect(deletePreset).toHaveBeenCalledWith("mine");
                expect(records().at(-1)).toMatchObject({ kind: "preset-deleted", preset: "mine" });
            });

            it("rejects with the host's reason, and records nothing, when the host cannot delete it", async () => {
                const { controllers, kinds } = open();

                await expect(service.remove(controllers, { deletePreset: async () => { throw new Error("offline"); }, read: async () => undefined }, "mine")).rejects.toThrow("offline");

                expect(kinds()).not.toContain("preset-deleted");
            });

            it("rejects, and records nothing, when the host has no way to delete one", async () => {
                const { controllers, kinds } = open();

                await expect(service.remove(controllers, { read: async () => undefined }, "mine")).rejects.toThrow("The host cannot delete presets.");

                expect(kinds()).not.toContain("preset-deleted");
            });
        });
    });
});
