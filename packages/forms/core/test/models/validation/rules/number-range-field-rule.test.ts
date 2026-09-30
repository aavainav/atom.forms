import { describe, expect, it } from "vitest";

import { NumberFieldModel } from "../../../../src/models/number-field";
import { NumberRangeFieldRule } from "../../../../src/models/validation/rules/number-range-field-rule";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields } from "../../../fixtures/citation-form";

function amount(value: number | null): NumberFieldModel {
    return new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: null }).setValue(value);
}

describe("NumberRangeFieldRule", () => {
    const rule = new NumberRangeFieldRule(chargeFields.fineAmount, 10, 100);

    it("accepts a value within the range, including its bounds", () => {
        expect(rule.validate(stubRuleContext(amount(50)))).toHaveLength(0);
        expect(rule.validate(stubRuleContext(amount(10)))).toHaveLength(0);
        expect(rule.validate(stubRuleContext(amount(100)))).toHaveLength(0);
    });

    it("reports a value outside the range", () => {
        expect(rule.validate(stubRuleContext(amount(9)))).toHaveLength(1);
        expect(rule.validate(stubRuleContext(amount(101)))).toHaveLength(1);
    });

    it("carries the default message", () => {
        expect(rule.validate(stubRuleContext(amount(101)))[0].message)
            .toBe("This field is not within the allowed range of values.");
    });

    /** An empty value is the required rule's concern. */
    it("skips a blank number field", () => {
        expect(rule.validate(stubRuleContext(amount(null)))).toHaveLength(0);
    });

    /** Zero is an answer like any other, so it is held to the range. */
    it("checks a real zero against the range", () => {
        expect(rule.validate(stubRuleContext(amount(0)))).toHaveLength(1);
    });

    /** A non-numeric value is the format rule's concern. */
    it("skips a value that is not a number", () => {
        const text = new StringFieldModel({ label: "Driver license number", name: "driver-license-number", value: "" })
            .setValue("not a number");

        expect(new NumberRangeFieldRule(violatorFields.driverLicenseNumber, 10, 100).validate(stubRuleContext(text)))
            .toHaveLength(0);
    });
});
