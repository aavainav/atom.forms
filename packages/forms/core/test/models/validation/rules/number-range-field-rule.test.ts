import { describe, expect, it } from "vitest";

import { NumberFieldModel } from "../../../../src/models/number-field";
import { NumberRangeFieldRule } from "../../../../src/models/validation/rules/number-range-field-rule";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields } from "../../../fixtures/citation-form";

function amount(value: number): NumberFieldModel {
    return new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: "" }).setValue(value);
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

    /** An empty value is the required rule's concern -- and for a number field, zero is empty. */
    it("skips an empty value, which for a number field means zero", () => {
        expect(rule.validate(stubRuleContext(amount(0)))).toHaveLength(0);
    });

    /** A non-numeric value is the format rule's concern. */
    it("skips a value that is not a number", () => {
        const text = new StringFieldModel({ label: "Driver license number", name: "driver-license-number", value: "" })
            .setValue("not a number");

        expect(new NumberRangeFieldRule(violatorFields.driverLicenseNumber, 10, 100).validate(stubRuleContext(text)))
            .toHaveLength(0);
    });
});
