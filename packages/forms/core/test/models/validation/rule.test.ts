import { describe, expect, it } from "vitest";

import { ComparisonOperator, FieldValueCondition } from "../../../src/models/validation/conditions/field-value-condition";
import { RequiredFieldRule } from "../../../src/models/validation/rules/required-field-rule";
import { StringFieldModel } from "../../../src/models/string-field";
import { stubRuleContextFor } from "../../fixtures/rule-context";
import { violatorFields } from "../../fixtures/citation-form";

function text(name: string, value: string): StringFieldModel {
    return new StringFieldModel({ label: name, name, value: "" }).setValue(value);
}

describe("Rule.when", () => {
    const rule = new RequiredFieldRule(violatorFields.driverLicenseNumber);
    const onlyWhenNamed = new FieldValueCondition(violatorFields.firstName, ComparisonOperator.isNotEmpty);

    function context(firstName: string, licenceNumber: string) {
        return stubRuleContextFor([
            [violatorFields.firstName, text("first-name", firstName)],
            [violatorFields.driverLicenseNumber, text("driver-license-number", licenceNumber)]
        ]);
    }

    /** The same `withChanges` invariant as everywhere else: gating a rule returns a copy rather than mutating it. */
    it("returns a new rule and leaves the original ungated", () => {
        const gated = rule.when(onlyWhenNamed);

        expect(gated).not.toBe(rule);
        expect(gated.condition).toBe(onlyWhenNamed);
        expect(rule.condition).toBeUndefined();
    });

    it("keeps the original's type and message", () => {
        const gated = rule.when(onlyWhenNamed);

        expect(gated).toBeInstanceOf(RequiredFieldRule);
        expect(gated.message).toBe("This field is required.");
    });

    it("evaluates the rule when its condition is satisfied", () => {
        expect(rule.when(onlyWhenNamed).validate(context("Dana", ""))).toHaveLength(1);
    });

    it("reports nothing when its condition is not satisfied", () => {
        expect(rule.when(onlyWhenNamed).validate(context("", ""))).toHaveLength(0);
    });

    it("still reports nothing when the gated rule would have passed anyway", () => {
        expect(rule.when(onlyWhenNamed).validate(context("", "12345"))).toHaveLength(0);
    });

    it("leaves the ungated original reporting either way", () => {
        expect(rule.validate(context("", ""))).toHaveLength(1);
    });
});
