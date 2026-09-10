import { describe, expect, it } from "vitest";

import { AlphanumericFieldRule } from "../../../../src/models/validation/rules/alphanumeric-field-rule";
import { PatternFieldRule } from "../../../../src/models/validation/rules/pattern-field-rule";
import { RuleIssueSeverity } from "../../../../src/models/validation/rule-issue";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { violatorFields } from "../../../fixtures/citation-form";

const spec = { label: "Driver license number", name: "driver-license-number", value: "" };

function field(value: string): StringFieldModel {
    return new StringFieldModel(spec).setValue(value);
}

describe("PatternFieldRule", () => {
    it("reports an issue when the value does not match", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[0-9]+$/);

        const issues = rule.validate(stubRuleContext(field("abc")));

        expect(issues).toHaveLength(1);
        expect(issues[0].message).toBe("This field is not in the expected format.");
        expect(issues[0].severity).toBe(RuleIssueSeverity.error);
    });

    it("reports nothing when the value matches", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[0-9]+$/);

        expect(rule.validate(stubRuleContext(field("12345")))).toHaveLength(0);
    });

    /** An empty value is the required rule's concern, not the pattern's. */
    it("skips an empty value", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[0-9]+$/);

        expect(rule.validate(stubRuleContext(new StringFieldModel(spec)))).toHaveLength(0);
    });

    /**
     * A global pattern carries `lastIndex` between calls, and a rule instance is reused across every instance of
     * its field -- so a global flag would make the same value pass and fail on alternate pages.
     */
    it("strips a global flag from the pattern it was given", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[0-9]+$/g);

        expect(rule.pattern.global).toBe(false);
        expect(rule.pattern.flags).toBe("");
        expect(rule.pattern.source).toBe("^[0-9]+$");
    });

    it("answers the same way however many times it is validated", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[0-9]+$/g);
        const context = stubRuleContext(field("12345"));

        expect(rule.validate(context)).toHaveLength(0);
        expect(rule.validate(context)).toHaveLength(0);
        expect(rule.validate(context)).toHaveLength(0);
    });

    it("keeps a flag that is not global", () => {
        const rule = new PatternFieldRule(violatorFields.driverLicenseNumber, /^[a-z]+$/i);

        expect(rule.pattern.flags).toBe("i");
        expect(rule.validate(stubRuleContext(field("ABC")))).toHaveLength(0);
    });

    /** `new.target` is the constructor actually invoked, so a derived rule registers under its own name. */
    it("names itself after the constructor that was invoked", () => {
        class LicensePlateRule extends PatternFieldRule { }

        expect(new PatternFieldRule(violatorFields.driverLicenseNumber, /a/).name).toBe("PatternFieldRule");
        expect(new LicensePlateRule(violatorFields.driverLicenseNumber, /a/).name).toBe("LicensePlateRule");
    });
});

describe("AlphanumericFieldRule", () => {
    it("accepts letters and numbers and rejects anything else", () => {
        const rule = new AlphanumericFieldRule(violatorFields.driverLicenseNumber);

        expect(rule.validate(stubRuleContext(field("AB123")))).toHaveLength(0);
        expect(rule.validate(stubRuleContext(field("AB-123")))).toHaveLength(1);
    });

    it("carries its own default message and registers under its own name", () => {
        const rule = new AlphanumericFieldRule(violatorFields.driverLicenseNumber);

        expect(rule.name).toBe("AlphanumericFieldRule");
        expect(rule.validate(stubRuleContext(field("AB-123")))[0].message)
            .toBe("This field may only contain letters and numbers.");
    });
});
