import { describe, expect, it } from "vitest";

import { CompositeRule } from "../../../../src/models/validation/rules/composite-rule";
import { LogicalOperator } from "../../../../src/models/validation/logical-operator";
import { MaxLengthFieldRule } from "../../../../src/models/validation/rules/max-length-field-rule";
import { RequiredFieldRule } from "../../../../src/models/validation/rules/required-field-rule";
import { RuleIssueSeverity } from "../../../../src/models/validation/rule-issue";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContextFor } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields, violatorSection } from "../../../fixtures/citation-form";

function text(name: string, value: string): StringFieldModel {
    return new StringFieldModel({ label: name, name, value: "" }).setValue(value);
}

/** Resolves the two violator fields the groups below are built over. */
function context(firstName: string, licenceNumber: string) {
    return stubRuleContextFor([
        [violatorFields.firstName, text("first-name", firstName)],
        [violatorFields.driverLicenseNumber, text("driver-license-number", licenceNumber)]
    ]);
}

describe("CompositeRule", () => {
    it("refuses to be built without any rules", () => {
        expect(() => new CompositeRule(LogicalOperator.and, [])).toThrowError("A composite rule requires at least one rule.");
        expect(() => CompositeRule.all()).toThrowError("A composite rule requires at least one rule.");
    });

    it("hands back a copy of its rules", () => {
        const rule = CompositeRule.all(new RequiredFieldRule(violatorFields.firstName));

        rule.getRules().push(new RequiredFieldRule(violatorFields.dateOfBirth));

        expect(rule.getRules()).toHaveLength(1);
    });

    describe("and", () => {
        /** Every issue is reported, so the user sees everything wrong at once rather than one thing at a time. */
        it("reports every issue its rules produce, each keeping its own message", () => {
            const rule = CompositeRule.all(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(violatorFields.driverLicenseNumber));

            const issues = rule.validate(context("", ""));

            expect(issues).toHaveLength(2);
            expect(issues.every(issue => issue.message === "This field is required.")).toBe(true);
        });

        it("reports nothing when every rule passes", () => {
            const rule = CompositeRule.all(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(violatorFields.driverLicenseNumber));

            expect(rule.validate(context("Dana", "12345"))).toHaveLength(0);
        });

        it("builds a group over one field from a callback", () => {
            const rule = CompositeRule.and(violatorFields.firstName, definition => [
                new RequiredFieldRule(definition),
                new MaxLengthFieldRule(definition, 0, 3)
            ]);

            expect(rule.validate(context("Alexandra", "12345"))).toHaveLength(1);
        });
    });

    describe("or", () => {
        it("reports nothing as soon as one of its rules passes", () => {
            const rule = CompositeRule.any(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(violatorFields.driverLicenseNumber));

            expect(rule.validate(context("Dana", ""))).toHaveLength(0);
            expect(rule.validate(context("", "12345"))).toHaveLength(0);
        });

        it("reports the rules' own issues when they all fail and the group has no message", () => {
            const rule = CompositeRule.any(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(violatorFields.driverLicenseNumber));

            const issues = rule.validate(context("", ""));

            expect(issues).toHaveLength(2);
            expect(issues.every(issue => issue.message === "This field is required.")).toBe(true);
        });

        /** The group's message stands in for the rules' own, once per offending field rather than once per rule. */
        it("replaces the rules' messages with its own, deduped per field", () => {
            const rule = CompositeRule.or(
                violatorFields.firstName,
                definition => [new MaxLengthFieldRule(definition, 5, 10), new MaxLengthFieldRule(definition, 0, 1)],
                "Give a name of five characters or more.");

            const issues = rule.validate(context("Al", "12345"));

            expect(issues).toHaveLength(1);
            expect(issues[0].message).toBe("Give a name of five characters or more.");
        });

        it("reports the group's message once for each offending field", () => {
            const rule = new CompositeRule(
                LogicalOperator.or,
                [new RequiredFieldRule(violatorFields.firstName), new RequiredFieldRule(violatorFields.driverLicenseNumber)],
                "Give either a name or a licence number.",
                RuleIssueSeverity.warning);

            const issues = rule.validate(context("", ""));

            expect(issues).toHaveLength(2);
            expect(issues.every(issue => issue.message === "Give either a name or a licence number.")).toBe(true);
            expect(issues.every(issue => issue.severity === RuleIssueSeverity.warning)).toBe(true);
        });
    });

    describe("isShared", () => {
        /** One rule reading a per-page field makes the whole group's answer differ per page. */
        it("is shared only when every rule in the group is", () => {
            expect(violatorSection.isShared).toBe(true);

            expect(CompositeRule.all(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(violatorFields.driverLicenseNumber)).isShared()).toBe(true);

            expect(CompositeRule.all(
                new RequiredFieldRule(violatorFields.firstName),
                new RequiredFieldRule(chargeFields.offenseDescription)).isShared()).toBe(false);
        });
    });

    /**
     * Characterization, not specification. A group answers with its *first* rule's page definition, so a group
     * spanning two page definitions is only ever evaluated against the pages of the first one.
     */
    it("takes its page definition from its first rule alone", () => {
        const rule = CompositeRule.all(
            new RequiredFieldRule(violatorFields.firstName),
            new RequiredFieldRule(chargeFields.offenseDescription));

        expect(rule.getPageDefinition()).toBe(violatorFields.firstName.getPageDefinition());
    });
});
