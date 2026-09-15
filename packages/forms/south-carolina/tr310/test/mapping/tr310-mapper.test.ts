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
            expect(mapper.extract(await mapper.populate(form, { data }))).toEqual(data);
        });

        it("survives a second trip unchanged", async () => {
            const once = mapper.extract(await mapper.populate(form, { data }));
            const twice = mapper.extract(await mapper.populate(await createForm(), { data: once }));

            expect(twice).toEqual(once);
        });

        it("returns every person and unit it was given", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                data: {
                    persons: [person, person],
                    units: [unit, unit, unit]
                }
            }));

            expect(extracted.persons).toHaveLength(2);
            expect(extracted.units).toHaveLength(3);
            expect(extracted.persons?.[0]).toEqual(person);
            expect(extracted.units?.[2]).toEqual(unit);
        });
    });

    describe("extract", () => {
        /** A new crash report stamps the date and time on itself; every other flat field now reports its own default. */
        it("stamps the date and time a new report carries on itself", () => {
            const extracted = mapper.extract(form);

            expect(extracted.collisionDate).toBeTruthy();
            expect(extracted.collisionTime).toBeTruthy();
        });

        it("reports every flat field, whether answered or not", () => {
            const extracted = mapper.extract(form);

            expect(extracted.collisionCityOrTown).toBe("");
        });

        /**
         * The person and unit arrays are always reported: a crash report starts with one of each page, and a page
         * carries its position in the record rather than only its values -- so an untouched page is reported as an
         * entry rather than dropped, which would renumber the ones after it.
         */
        it("reports an entry per page, its fields at their default for a page nothing has been entered on", () => {
            const extracted = mapper.extract(form);

            expect(extracted.persons).toHaveLength(1);
            expect(extracted.units).toHaveLength(1);
            expect(extracted.persons?.[0].personFirstName).toBe("");
        });

        it("reports an unanswered field within a person at its default rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { persons: [{ personFirstName: "Dana" }] } }));

            expect(extracted.persons?.[0].personFirstName).toBe("Dana");
            expect(extracted.persons?.[0].personLastName).toBe("");
        });
    });

    describe("populate", () => {
        it("creates a person page per person in the record", async () => {
            const populated = await mapper.populate(form, { data: { persons: [person, person, person] } });

            expect(populated.get<PageCollection>(populated.personPage).pages).toHaveLength(3);
        });

        it("creates a unit page per unit in the record", async () => {
            const populated = await mapper.populate(form, { data: { units: [unit, unit] } });

            expect(populated.get<PageCollection>(populated.unitPage).pages).toHaveLength(2);
        });

        /** A record naming fewer people than the form holds must not silently discard a page an officer added. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePeople = await mapper.populate(form, { data: { persons: [person, person, person] } });

            const populated = await mapper.populate(threePeople, { data: { persons: [person] } });

            expect(populated.get<PageCollection>(populated.personPage).pages).toHaveLength(3);
        });

        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { data: { collisionDate: "01/31/2026" } });
            const twice = await mapper.populate(once, { data: { collisionCityOrTown: "Columbia" } });

            const extracted = mapper.extract(twice);

            expect(extracted.collisionDate).toBe("01/31/2026");
            expect(extracted.collisionCityOrTown).toBe("Columbia");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { collisionCityOrTown: "Columbia" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).collisionCityOrTown).toBe("");
        });
    });
});
