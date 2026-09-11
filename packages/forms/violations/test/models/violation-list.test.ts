import { describe, expect, it } from "vitest";

import type { IViolation } from "../../src/models/violation";
import type { IViolationListDefinition } from "../../src/models/violation-list-definition";
import { ViolationList } from "../../src/models/violation-list";
import { toViolations } from "../../src/models/violation";

const definition: IViolationListDefinition = { id: "sc-s438:violation", load: () => Promise.resolve([]) };

const violations: ReadonlyArray<IViolation> = [
    { code: "56-5-1520", description: "Speeding", category: "Speed", statute: "56-5-1520", fine: 81.25, points: 2 },
    { code: "56-5-2930", description: "Driving under the influence", category: "Impaired", statute: "56-5-2930" },
    { code: "56-1-20", description: "Driving without a licence", category: "Licence", statute: "56-1-20" },
    { code: "56-5-1535", description: "Speeding in a work zone", category: "Speed", statute: "56-5-1535" },
    { code: "LOC-1", description: "Parking on a sidewalk", isLocalOrdinance: true }
];

function list(rows: ReadonlyArray<IViolation> = violations): ViolationList {
    return new ViolationList(definition, rows);
}

describe("ViolationList", () => {
    describe("getViolations", () => {
        it("answers every violation in the list", () => {
            expect(list().getViolations()).toHaveLength(5);
        });
    });

    describe("findByCode", () => {
        it("finds a violation by its code", () => {
            expect(list().findByCode("56-5-1520")?.description).toBe("Speeding");
        });

        it("answers undefined for a code it does not hold", () => {
            expect(list().findByCode("99-9-9999")).toBeUndefined();
        });

        it("answers undefined for a blank code rather than matching something", () => {
            expect(list().findByCode("")).toBeUndefined();
        });

        /** A legacy code list carries genuine duplicates, and the earlier one is where a linear search would stop. */
        it("answers the first match when a code repeats", () => {
            const duplicated = list([
                { code: "A", description: "First" },
                { code: "A", description: "Second" }
            ]);

            expect(duplicated.findByCode("A")?.description).toBe("First");
        });
    });

    describe("getCategories", () => {
        it("answers the distinct categories in alphabetical order", () => {
            expect(list().getCategories()).toEqual(["Impaired", "Licence", "Speed"]);
        });

        /** A list carrying no categories is one the selector cannot offer a category filter for. */
        it("answers nothing for a list that files nothing under a category", () => {
            expect(list([{ code: "A", description: "First" }]).getCategories()).toEqual([]);
        });

        it("leaves out a violation that carries no category of its own", () => {
            expect(list().getCategories()).not.toContain(undefined);
            expect(list().getCategories()).toHaveLength(3);
        });

        it("answers the same way however many times it is asked", () => {
            const built = list();

            expect(built.getCategories()).toEqual(built.getCategories());
        });
    });

    describe("search", () => {
        /** This is what the selector shows before anything has been typed. */
        it("answers the whole list for an empty term and no category", () => {
            expect(list().search("")).toHaveLength(5);
            expect(list().search("   ")).toHaveLength(5);
        });

        it("matches on description, ignoring case", () => {
            expect(list().search("speeding").map(violation => violation.code))
                .toEqual(["56-5-1520", "56-5-1535"]);
        });

        it("matches on code", () => {
            expect(list().search("56-1-20").map(violation => violation.description))
                .toEqual(["Driving without a licence"]);
        });

        it("answers nothing when the term matches neither code, statute nor description", () => {
            expect(list().search("aeroplane")).toHaveLength(0);
        });

        /**
         * An officer typing a section number knows exactly which charge they are after, and should not have to
         * scroll past every description that happens to mention it.
         */
        it("puts matches whose code starts with the term ahead of the rest", () => {
            const ranked = list([
                { code: "999", description: "Mentions 56-5 in the text" },
                { code: "56-5-1520", description: "Speeding" }
            ]);

            expect(ranked.search("56-5").map(violation => violation.code)).toEqual(["56-5-1520", "999"]);
        });

        it("treats a statute prefix the same way as a code prefix", () => {
            const ranked = list([
                { code: "B", description: "Mentions 12-34 in the text" },
                { code: "A", description: "Something else", statute: "12-34" }
            ]);

            expect(ranked.search("12-34").map(violation => violation.code)).toEqual(["A", "B"]);
        });

        it("narrows to a category when one is named", () => {
            expect(list().search("", "Speed").map(violation => violation.code))
                .toEqual(["56-5-1520", "56-5-1535"]);
        });

        /** The category narrows before the term, so the ordering the term produces is the ordering that comes back. */
        it("applies the category before the term", () => {
            expect(list().search("speeding", "Speed")).toHaveLength(2);
            expect(list().search("speeding", "Licence")).toHaveLength(0);
        });

        it("answers nothing for a category the list does not use", () => {
            expect(list().search("", "Aviation")).toHaveLength(0);
        });
    });
});

describe("toViolations", () => {
    it("expands a minimal row into a violation", () => {
        expect(toViolations([["A", "Speeding"]])).toEqual([{ code: "A", description: "Speeding" }]);
    });

    it("expands a full row into every field", () => {
        expect(toViolations([["A", "Speeding", "Speed", "56-5-1520", 81.25, 2, false, true]])).toEqual([{
            code: "A",
            description: "Speeding",
            category: "Speed",
            statute: "56-5-1520",
            fine: 81.25,
            points: 2,
            isLocalOrdinance: false,
            requiresCourtAppearance: true
        }]);
    });

    /**
     * An absent field is left off rather than written as undefined, so a form asking whether a violation carries
     * a fine gets the same answer from a generated row as from a hand-registered one.
     */
    it("leaves an absent field off entirely rather than setting it undefined", () => {
        const [violation] = toViolations([["A", "Speeding"]]);

        expect("fine" in violation).toBe(false);
        expect("category" in violation).toBe(false);
        expect(Object.keys(violation)).toEqual(["code", "description"]);
    });

    /** A gap before a later field is held open with an undefined, which must not become a key either. */
    it("keeps a held-open gap off the violation while carrying the field after it", () => {
        const [violation] = toViolations([["A", "Speeding", undefined, undefined, 81.25]]);

        expect(violation.fine).toBe(81.25);
        expect("category" in violation).toBe(false);
        expect("statute" in violation).toBe(false);
    });

    it("keeps a false flag, which is not the same as an absent one", () => {
        const [violation] = toViolations([["A", "Speeding", undefined, undefined, undefined, undefined, false]]);

        expect(violation.isLocalOrdinance).toBe(false);
        expect("isLocalOrdinance" in violation).toBe(true);
    });

    it("expands an empty set of rows to an empty list", () => {
        expect(toViolations([])).toEqual([]);
    });
});
