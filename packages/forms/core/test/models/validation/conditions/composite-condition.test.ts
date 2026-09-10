import { describe, expect, it } from "vitest";

import { Condition } from "../../../../src/models/validation/condition";
import { CompositeCondition } from "../../../../src/models/validation/conditions/composite-condition";
import { LogicalOperator } from "../../../../src/models/validation/logical-operator";
import { stubRuleContext } from "../../../fixtures/rule-context";

/** The composite only asks its children for an answer, so a stub child is enough to test the combining. */
class StubCondition extends Condition {
    constructor(private readonly answer: boolean) {
        super("StubCondition");
    }

    public isSatisfied(): boolean {
        return this.answer;
    }
}

const yes = new StubCondition(true);
const no = new StubCondition(false);
const context = stubRuleContext(undefined);

describe("CompositeCondition", () => {
    it("refuses to be built without any conditions", () => {
        expect(() => new CompositeCondition(LogicalOperator.and, []))
            .toThrowError("A composite condition requires at least one condition.");
        expect(() => CompositeCondition.all()).toThrowError("A composite condition requires at least one condition.");
    });

    describe("all", () => {
        it("is satisfied only when every condition is", () => {
            expect(CompositeCondition.all(yes, yes).isSatisfied(context)).toBe(true);
            expect(CompositeCondition.all(yes, no).isSatisfied(context)).toBe(false);
            expect(CompositeCondition.all(no, no).isSatisfied(context)).toBe(false);
        });
    });

    describe("any", () => {
        it("is satisfied when at least one condition is", () => {
            expect(CompositeCondition.any(no, yes).isSatisfied(context)).toBe(true);
            expect(CompositeCondition.any(yes, yes).isSatisfied(context)).toBe(true);
            expect(CompositeCondition.any(no, no).isSatisfied(context)).toBe(false);
        });
    });

    it("nests, so a group can combine groups", () => {
        expect(CompositeCondition.all(CompositeCondition.any(no, yes), yes).isSatisfied(context)).toBe(true);
        expect(CompositeCondition.all(CompositeCondition.any(no, no), yes).isSatisfied(context)).toBe(false);
    });

    it("hands back a copy of its conditions", () => {
        const condition = CompositeCondition.all(yes);

        condition.getConditions().push(no);

        expect(condition.getConditions()).toHaveLength(1);
    });
});
