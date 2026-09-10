import { describe, expect, it } from "vitest";

import type { Rule } from "../../../src/models/validation/rule";
import { RuleCollection } from "../../../src/models/validation/rule-collection";

/** The collection never evaluates a rule, so a stub keeps the test about the collection. */
function rule(name: string): Rule {
    return { name } as unknown as Rule;
}

describe("RuleCollection", () => {
    const required = rule("required");
    const pattern = rule("pattern");

    it("starts empty", () => {
        expect(new RuleCollection().getRules()).toHaveLength(0);
    });

    it("returns a new collection when a rule is added, leaving the original alone", () => {
        const collection = new RuleCollection([required]);

        const added = collection.addRule(pattern);

        expect(added).not.toBe(collection);
        expect(added.getRules()).toEqual([required, pattern]);
        expect(collection.getRules()).toEqual([required]);
    });

    it("returns a new collection when another collection is added", () => {
        const collection = new RuleCollection([required]);

        const added = collection.addRuleCollection(new RuleCollection([pattern]));

        expect(added.getRules()).toEqual([required, pattern]);
        expect(collection.getRules()).toEqual([required]);
    });

    it("hands back a copy, so mutating the result does not reach the collection", () => {
        const collection = new RuleCollection([required]);

        collection.getRules().push(pattern);

        expect(collection.getRules()).toEqual([required]);
    });
});
