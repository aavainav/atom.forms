import { describe, expect, it } from "vitest";

import { MaxLengthFieldRule } from "../../../../src/models/validation/rules/max-length-field-rule";
import { NumberFieldModel } from "../../../../src/models/number-field";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields } from "../../../fixtures/citation-form";

const spec = { label: "Driver license number", name: "driver-license-number", value: "" };

function field(value: string): StringFieldModel {
    return new StringFieldModel(spec).setValue(value);
}

describe("MaxLengthFieldRule", () => {
    it("accepts a value within both bounds", () => {
        const rule = new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4);

        expect(rule.validate(stubRuleContext(field("abc")))).toHaveLength(0);
    });

    it("reports a value longer than the maximum", () => {
        const rule = new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4);

        expect(rule.validate(stubRuleContext(field("abcde")))).toHaveLength(1);
    });

    it("reports a value shorter than the minimum", () => {
        const rule = new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4);

        expect(rule.validate(stubRuleContext(field("a")))).toHaveLength(1);
    });

    /** The message interpolates `{maxLength}`, and it is the maximum that is substituted in. */
    it("interpolates the maximum into the default message", () => {
        const rule = new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4);

        expect(rule.validate(stubRuleContext(field("abcde")))[0].message)
            .toBe("This field exceeds the maximum length of 4 char(s).");
    });

    it("takes a message of its own, interpolating it the same way", () => {
        const rule = new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 0, 3, "No more than {maxLength}.");

        expect(rule.validate(stubRuleContext(field("abcd")))[0].message).toBe("No more than 3.");
    });

    /** An empty value is the required rule's concern, matching every other rule -- a non-zero minimum does not fire on a blank field. */
    it("skips an empty value even when the minimum is above zero", () => {
        const empty = new StringFieldModel(spec);

        expect(new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4).validate(stubRuleContext(empty))).toHaveLength(0);
    });

    describe("a number field", () => {
        function numberField(value: number): NumberFieldModel {
            return new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: "" }).setValue(value);
        }

        it("measures the length of its printed digits", () => {
            const rule = new MaxLengthFieldRule(chargeFields.fineAmount, 1, 3);

            expect(rule.validate(stubRuleContext(numberField(123)))).toHaveLength(0);
        });

        it("reports a value whose digit count exceeds the maximum", () => {
            const issues = new MaxLengthFieldRule(chargeFields.fineAmount, 1, 3).validate(stubRuleContext(numberField(12345)));

            expect(issues).toHaveLength(1);
            expect(issues[0].message).toBe("This field exceeds the maximum length of 3 char(s).");
        });

        it("skips zero, which reads as empty rather than a single digit", () => {
            const rule = new MaxLengthFieldRule(chargeFields.fineAmount, 1, 3);

            expect(rule.validate(stubRuleContext(numberField(0)))).toHaveLength(0);
        });
    });
});
