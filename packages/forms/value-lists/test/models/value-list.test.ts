import { describe, expect, it } from "vitest";

import type { IChildValueListOption, IValueListOption } from "../../src/models/value-list-option";
import type { IValueListDefinition } from "../../src/models/value-list-definition";
import { ValueList } from "../../src/models/value-list";
import { toOptions } from "../../src/models/value-list-option";

function definition(id: string, parentId?: string): IValueListDefinition {
    return { id, parentId, load: () => Promise.resolve([]) };
}

const states: ReadonlyArray<IValueListOption> = [
    { value: "SC", description: "South Carolina" },
    { value: "GA", description: "Georgia" },
    { value: "OK", description: "Oklahoma" }
];

const models: ReadonlyArray<IChildValueListOption> = [
    { value: "CAM", description: "Camry", parentValue: "TOYT" },
    { value: "COR", description: "Corolla", parentValue: "TOYT" },
    { value: "MUS", description: "Mustang", parentValue: "FORD" },
    { value: "F15", description: "F-150", parentValue: "FORD" }
];

describe("ValueList", () => {
    describe("a flat list", () => {
        const list = new ValueList(definition("states"), states);

        it("answers every option", () => {
            expect(list.getOptions()).toHaveLength(3);
        });

        it("finds an option by its code", () => {
            expect(list.findByValue("GA")?.description).toBe("Georgia");
        });

        it("finds an option by description, ignoring case and surrounding whitespace", () => {
            expect(list.findByValue("SC")?.description).toBe("South Carolina");
            expect(list.findByDescription("south carolina")?.value).toBe("SC");
            expect(list.findByDescription("  SOUTH CAROLINA  ")?.value).toBe("SC");
        });

        it("answers undefined for a code or description it does not hold", () => {
            expect(list.findByValue("ZZ")).toBeUndefined();
            expect(list.findByDescription("Atlantis")).toBeUndefined();
        });

        it("answers undefined for a blank lookup rather than matching something", () => {
            expect(list.findByValue("")).toBeUndefined();
            expect(list.findByDescription("")).toBeUndefined();
            expect(list.findByDescription("   ")).toBeUndefined();
        });

        it("ignores a parent value it has no use for", () => {
            expect(list.findByValue("GA", "anything")?.description).toBe("Georgia");
            expect(list.getOptions("anything")).toHaveLength(3);
        });
    });

    describe("a child list", () => {
        const list = new ValueList(definition("vehicle-models", "vehicle-makes"), models);

        /** A child list with no parent chosen has no options at all, rather than all of them. */
        it("answers nothing until a parent value is given", () => {
            expect(list.getOptions()).toHaveLength(0);
        });

        it("answers only the options hanging off the given parent", () => {
            expect(list.getOptions("TOYT").map(option => option.value)).toEqual(["CAM", "COR"]);
            expect(list.getOptions("FORD").map(option => option.value)).toEqual(["MUS", "F15"]);
        });

        it("answers nothing for a parent it holds no options for", () => {
            expect(list.getOptions("HOND")).toHaveLength(0);
        });

        /**
         * Descriptions are only unique underneath a single parent, so a lookup without one finds nothing rather
         * than guessing which make's model was meant.
         */
        it("finds nothing without the parent's value", () => {
            expect(list.findByDescription("Camry")).toBeUndefined();
            expect(list.findByValue("CAM")).toBeUndefined();
        });

        it("finds an option within its parent", () => {
            expect(list.findByDescription("Camry", "TOYT")?.value).toBe("CAM");
            expect(list.findByValue("CAM", "TOYT")?.description).toBe("Camry");
        });

        it("does not find an option under the wrong parent", () => {
            expect(list.findByDescription("Camry", "FORD")).toBeUndefined();
            expect(list.findByValue("CAM", "FORD")).toBeUndefined();
        });

        it("finds the same description under two different parents", () => {
            const shared = new ValueList(definition("models", "makes"), [
                { value: "ACC", description: "Accord", parentValue: "HOND" },
                { value: "ACD", description: "Accord", parentValue: "ACUR" }
            ] as ReadonlyArray<IChildValueListOption>);

            expect(shared.findByDescription("Accord", "HOND")?.value).toBe("ACC");
            expect(shared.findByDescription("Accord", "ACUR")?.value).toBe("ACD");
        });
    });

    /**
     * A legacy code list carries genuine duplicates -- two race codes both reading ASIAN OR PACIFIC ISLANDER --
     * and the earlier one is the one the linear search this index replaced would have stopped on.
     */
    describe("duplicate descriptions", () => {
        const list = new ValueList(definition("races"), [
            { value: "A", description: "Asian or Pacific Islander" },
            { value: "P", description: "Asian or Pacific Islander" }
        ]);

        it("answers the first match", () => {
            expect(list.findByDescription("Asian or Pacific Islander")?.value).toBe("A");
        });

        it("still finds each option by its own code", () => {
            expect(list.findByValue("P")?.value).toBe("P");
        });
    });

    describe("the indexes", () => {
        it("answers the same way however many times it is asked", () => {
            const list = new ValueList(definition("states"), states);

            expect(list.findByValue("GA")?.description).toBe("Georgia");
            expect(list.findByValue("GA")?.description).toBe("Georgia");
            expect(list.findByDescription("georgia")?.value).toBe("GA");
            expect(list.findByDescription("georgia")?.value).toBe("GA");
        });

        it("copes with an empty list", () => {
            const empty = new ValueList(definition("empty"), []);

            expect(empty.getOptions()).toHaveLength(0);
            expect(empty.findByValue("SC")).toBeUndefined();
            expect(empty.findByDescription("South Carolina")).toBeUndefined();
        });
    });
});

describe("toOptions", () => {
    it("expands a flat row into an option", () => {
        expect(toOptions([["SC", "South Carolina"]])).toEqual([{ value: "SC", description: "South Carolina" }]);
    });

    it("carries a parent value through when a row has one", () => {
        expect(toOptions([["CAM", "Camry", "TOYT"]]))
            .toEqual([{ value: "CAM", description: "Camry", parentValue: "TOYT" }]);
    });

    /** A row with no third element is a flat option, and must not gain an undefined `parentValue` key. */
    it("leaves a flat row without a parentValue key at all", () => {
        expect("parentValue" in toOptions([["SC", "South Carolina"]])[0]).toBe(false);
    });

    it("expands an empty set of rows to an empty list", () => {
        expect(toOptions([])).toEqual([]);
    });
});
