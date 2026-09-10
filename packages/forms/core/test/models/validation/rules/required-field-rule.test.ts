import { describe, expect, it } from "vitest";

import { BooleanFieldModel } from "../../../../src/models/boolean-field";
import { NumberFieldModel } from "../../../../src/models/number-field";
import { RequiredFieldRule } from "../../../../src/models/validation/rules/required-field-rule";
import { RuleIssueSeverity } from "../../../../src/models/validation/rule-issue";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { chargeFields, violatorFields, violatorSection } from "../../../fixtures/citation-form";

const spec = { label: "First name", name: "first-name", value: "" };

describe("RequiredFieldRule", () => {
    it("reports an issue when the field is empty", () => {
        const field = new StringFieldModel(spec);

        const issues = new RequiredFieldRule(violatorFields.firstName).validate(stubRuleContext(field));

        expect(issues).toHaveLength(1);
        expect(issues[0].field).toBe(field);
        expect(issues[0].message).toBe("This field is required.");
        expect(issues[0].severity).toBe(RuleIssueSeverity.error);
    });

    it("reports nothing when the field holds a value", () => {
        const field = new StringFieldModel(spec).setValue("Dana");

        expect(new RequiredFieldRule(violatorFields.firstName).validate(stubRuleContext(field))).toHaveLength(0);
    });

    it("takes a message and severity of its own", () => {
        const rule = new RequiredFieldRule(violatorFields.firstName, "Tell us the name.", RuleIssueSeverity.warning);

        const issues = rule.validate(stubRuleContext(new StringFieldModel(spec)));

        expect(issues[0].message).toBe("Tell us the name.");
        expect(issues[0].severity).toBe(RuleIssueSeverity.warning);
    });

    /** A number field reads zero as empty, so an untouched one is reported rather than passing as a valid 0. */
    it("reports an untouched number field, since zero reads as empty", () => {
        const field = new NumberFieldModel({ label: "Fine amount", name: "fine-amount", value: "" });

        expect(new RequiredFieldRule(chargeFields.fineAmount).validate(stubRuleContext(field))).toHaveLength(1);
        expect(new RequiredFieldRule(chargeFields.fineAmount).validate(stubRuleContext(field.setValue(50)))).toHaveLength(0);
    });

    /** A checkbox uses the base emptiness, so an unticked box is reported and a ticked one is not. */
    it("reports an unticked checkbox and accepts a ticked one", () => {
        const field = new BooleanFieldModel({ label: "Speeding related", name: "is-speeding-related", value: "" });

        expect(new RequiredFieldRule(chargeFields.isSpeedingRelated).validate(stubRuleContext(field))).toHaveLength(1);
        expect(new RequiredFieldRule(chargeFields.isSpeedingRelated).validate(stubRuleContext(field.setValue(true)))).toHaveLength(0);
    });

    it("reports nothing when the context cannot resolve the field", () => {
        expect(new RequiredFieldRule(violatorFields.firstName).validate(stubRuleContext(undefined))).toHaveLength(0);
    });

    it("answers the page its field belongs to", () => {
        expect(new RequiredFieldRule(violatorFields.firstName).getPageDefinition())
            .toBe(violatorFields.firstName.getPageDefinition());
    });

    /** A rule reading a shared section is evaluated once for the form rather than once per page. */
    it("is shared when its field's section is shared", () => {
        expect(violatorSection.isShared).toBe(true);
        expect(new RequiredFieldRule(violatorFields.firstName).isShared()).toBe(true);
        expect(new RequiredFieldRule(chargeFields.offenseDescription).isShared()).toBe(false);
    });
});
