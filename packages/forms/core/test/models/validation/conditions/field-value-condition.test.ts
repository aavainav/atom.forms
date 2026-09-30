import { describe, expect, it } from "vitest";

import { ComparisonOperator, FieldValueCondition } from "../../../../src/models/validation/conditions/field-value-condition";
import { NumberFieldModel } from "../../../../src/models/number-field";
import { OptionFieldModel } from "../../../../src/models/option-field";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields } from "../../../fixtures/citation-form";

const spec = { label: "First name", name: "first-name", value: "" };

function text(value: string): StringFieldModel {
    return new StringFieldModel(spec).setValue(value);
}

function option(value: string, description: string): OptionFieldModel {
    return new OptionFieldModel({ label: "Offense code", name: "offense-code", value: "" }).setValue({ value, description });
}

describe("FieldValueCondition", () => {
    describe("equals", () => {
        const condition = new FieldValueCondition(violatorFields.firstName, ComparisonOperator.equals, "Dana");

        it("is satisfied when the values match", () => {
            expect(condition.isSatisfied(stubRuleContext(text("Dana")))).toBe(true);
        });

        it("is not satisfied when they differ", () => {
            expect(condition.isSatisfied(stubRuleContext(text("Alex")))).toBe(false);
        });
    });

    describe("notEquals", () => {
        const condition = new FieldValueCondition(violatorFields.firstName, ComparisonOperator.notEquals, "Dana");

        it("is satisfied when the values differ", () => {
            expect(condition.isSatisfied(stubRuleContext(text("Alex")))).toBe(true);
        });

        it("is not satisfied when they match", () => {
            expect(condition.isSatisfied(stubRuleContext(text("Dana")))).toBe(false);
        });
    });

    describe("isEmpty and isNotEmpty", () => {
        it("reads emptiness from the field rather than comparing a value", () => {
            const isEmpty = new FieldValueCondition(violatorFields.firstName, ComparisonOperator.isEmpty);
            const isNotEmpty = new FieldValueCondition(violatorFields.firstName, ComparisonOperator.isNotEmpty);

            expect(isEmpty.isSatisfied(stubRuleContext(new StringFieldModel(spec)))).toBe(true);
            expect(isEmpty.isSatisfied(stubRuleContext(text("Dana")))).toBe(false);

            expect(isNotEmpty.isSatisfied(stubRuleContext(text("Dana")))).toBe(true);
            expect(isNotEmpty.isSatisfied(stubRuleContext(new StringFieldModel(spec)))).toBe(false);
        });

        /** The condition follows the field's own rule rather than a literal: a blank number is empty, and a real zero is not. */
        it("follows the field's own notion of empty, so a blank number is empty and zero is not", () => {
            const isEmpty = new FieldValueCondition(chargeFields.fineAmount, ComparisonOperator.isEmpty);
            const amount = new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: null });

            expect(isEmpty.isSatisfied(stubRuleContext(amount))).toBe(true);
            expect(isEmpty.isSatisfied(stubRuleContext(amount.setValue(0)))).toBe(false);
            expect(isEmpty.isSatisfied(stubRuleContext(amount.setValue(50)))).toBe(false);
        });
    });

    /** An option field holds a value/description pair, and it is the code that a condition compares against. */
    describe("an option field", () => {
        it("compares against the code rather than the pair", () => {
            const condition = new FieldValueCondition(chargeFields.offenseCode, ComparisonOperator.equals, "A");

            expect(condition.isSatisfied(stubRuleContext(option("A", "Alpha")))).toBe(true);
            expect(condition.isSatisfied(stubRuleContext(option("B", "Bravo")))).toBe(false);
        });

        it("unwraps both sides, so a pair may be given as the expected value", () => {
            const condition = new FieldValueCondition(
                chargeFields.offenseCode,
                ComparisonOperator.equals,
                { value: "A", description: "Alpha" });

            expect(condition.isSatisfied(stubRuleContext(option("A", "something else")))).toBe(true);
        });
    });

    /**
     * Characterization worth pinning: an unresolvable field makes the condition unsatisfied rather than throwing,
     * and it does so for `notEquals` too -- so a rule gated on "not equal to X" is skipped, not run, when the
     * field it reads is missing.
     */
    it("is unsatisfied for every operator when the field cannot be resolved", () => {
        const operators = [
            ComparisonOperator.equals,
            ComparisonOperator.notEquals,
            ComparisonOperator.isEmpty,
            ComparisonOperator.isNotEmpty
        ];

        for (const operator of operators) {
            expect(new FieldValueCondition(violatorFields.firstName, operator, "Dana").isSatisfied(stubRuleContext(undefined)))
                .toBe(false);
        }
    });
});
