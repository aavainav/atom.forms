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

    /**
     * Characterization, not specification. Unlike every other rule this one does not skip an empty value: a blank
     * field has length 0, so a non-zero minimum reports against it. `RequiredFieldRule` is therefore not the only
     * rule that fires on an empty value, which is what `core/CLAUDE.md` claims.
     */
    it("reports an empty value when the minimum is above zero", () => {
        const empty = new StringFieldModel(spec);

        expect(new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 2, 4).validate(stubRuleContext(empty))).toHaveLength(1);
        expect(new MaxLengthFieldRule(violatorFields.driverLicenseNumber, 0, 4).validate(stubRuleContext(empty))).toHaveLength(0);
    });

    /**
     * Characterization, not specification. The rule reads `(field.value as string)?.length`, which is undefined
     * for a number and falls back to 0 -- so a length rule with a non-zero minimum always reports against a number
     * field, whatever it holds, and does so with a message about exceeding the maximum.
     */
    it("always reports against a number field when the minimum is above zero", () => {
        const number = new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: "" }).setValue(12345);

        const issues = new MaxLengthFieldRule(chargeFields.fineAmount, 1, 3).validate(stubRuleContext(number));

        expect(issues).toHaveLength(1);
        expect(issues[0].message).toBe("This field exceeds the maximum length of 3 char(s).");
    });
});
