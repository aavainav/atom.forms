import { beforeEach, describe, expect, it } from "vitest";

import type { PageCollection } from "@forms/core";
import { TR310FormModel } from "../../src/models/tr310-form";
import { TR310Mapper } from "../../src/mapping/tr310-mapper";
import { createForm } from "../fixtures/form";
import { data, person, unit } from "../fixtures/tr310-data";

describe("TR310Mapper", () => {
    const mapper = new TR310Mapper();
    let form: TR310FormModel;

    beforeEach(async () => {
        form = await createForm();
    });

    describe("a round trip", () => {
        /**
         * The pair is what a mapper exists for, and this is the form where it matters most: the largest contract
         * in the repo, mapped by hand. A field wired into one direction and missed in the other shows up here, and
         * so does one whose value is written into a neighbouring box -- every value in the fixture is distinct.
         */
        it("returns every field it was given", async () => {
            expect(mapper.extract(await mapper.populate(form, data))).toEqual(data);
        });

        it("survives a second trip unchanged", async () => {
            const once = mapper.extract(await mapper.populate(form, data));
            const twice = mapper.extract(await mapper.populate(await createForm(), once));

            expect(twice).toEqual(once);
        });

        it("returns every person and unit it was given", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                persons: [person, person],
                units: [unit, unit, unit]
            }));

            expect(extracted.persons).toHaveLength(2);
            expect(extracted.units).toHaveLength(3);
            expect(extracted.persons?.[0]).toEqual(person);
            expect(extracted.units?.[2]).toEqual(unit);
        });
    });

    describe("extract", () => {
        /** A new crash report stamps the date and time on itself, so those two are reported and no other flat field is. */
        it("reports only the date and time a new report stamps on itself", () => {
            expect(Object.keys(mapper.extract(form)).sort()).toEqual(["collisionDate", "collisionTime", "persons", "units"]);
        });

        /**
         * Unlike the flat fields, the person and unit arrays are always reported: a crash report starts with one
         * of each page, and a page carries its position in the record rather than only its values -- so an
         * untouched page is reported as an empty entry rather than dropped, which would renumber the ones after it.
         */
        it("reports an entry per page, empty for a page nothing has been entered on", () => {
            const extracted = mapper.extract(form);

            expect(extracted.persons).toEqual([{}]);
            expect(extracted.units).toEqual([{}]);
        });

        it("omits an unanswered field within a person rather than reporting its default", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { persons: [{ personFirstName: "Dana" }] }));

            expect(extracted.persons?.[0]).toEqual({ personFirstName: "Dana" });
        });
    });

    describe("populate", () => {
        it("creates a person page per person in the record", async () => {
            const populated = await mapper.populate(form, { persons: [person, person, person] });

            expect(populated.get<PageCollection>(populated.personPage).pages).toHaveLength(3);
        });

        it("creates a unit page per unit in the record", async () => {
            const populated = await mapper.populate(form, { units: [unit, unit] });

            expect(populated.get<PageCollection>(populated.unitPage).pages).toHaveLength(2);
        });

        /** A record naming fewer people than the form holds must not silently discard a page an officer added. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePeople = await mapper.populate(form, { persons: [person, person, person] });

            const populated = await mapper.populate(threePeople, { persons: [person] });

            expect(populated.get<PageCollection>(populated.personPage).pages).toHaveLength(3);
        });

        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { collisionDate: "01/31/2026" });
            const twice = await mapper.populate(once, { collisionCityOrTown: "Columbia" });

            const extracted = mapper.extract(twice);

            expect(extracted.collisionDate).toBe("01/31/2026");
            expect(extracted.collisionCityOrTown).toBe("Columbia");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { collisionCityOrTown: "Columbia" });

            expect(populated).not.toBe(form);
            expect("collisionCityOrTown" in mapper.extract(form)).toBe(false);
        });
    });
});
