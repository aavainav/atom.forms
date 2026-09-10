import { beforeEach, describe, expect, it } from "vitest";

import { RuleCollection } from "../../../src/models/validation/rule-collection";
import { RulesController } from "../../../src/models/validation/rules-controller";
import { PatternFieldRule } from "../../../src/models/validation/rules/pattern-field-rule";
import { RequiredFieldRule } from "../../../src/models/validation/rules/required-field-rule";
import {
    addCitationPage,
    chargeFields,
    chargeSection,
    createTestForm,
    setFieldValue,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../../fixtures/citation-form";

describe("RegisterRule", () => {
    /**
     * The decorator expression references the class it decorates, which is only legal under legacy decorator
     * semantics. If oxc ever transforms these as standard decorators this file fails to import at all, long
     * before the assertion is reached -- which is the loud failure worth having.
     */
    it("registers a rule class under its own name when its module is imported", () => {
        expect(RulesController.typeRegistry.get("RequiredFieldRule")).toBe(RequiredFieldRule);
        expect(RulesController.typeRegistry.get("PatternFieldRule")).toBe(PatternFieldRule);
    });
});

describe("RulesController", () => {
    let form: TestCitationForm;

    beforeEach(async () => {
        form = await createTestForm();
    });

    it("reports an issue for a field left empty", () => {
        const controller = new RulesController(form, new RuleCollection([new RequiredFieldRule(violatorFields.firstName)]));

        controller.validate();

        const issues = controller.getIssueCollection().getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].message).toBe("This field is required.");
        expect(issues[0].field.name).toBe("first-name");
    });

    it("reports nothing once the field holds a value", () => {
        const controller = new RulesController(
            setFieldValue(form, violatorSection, violatorFields.firstName, "Dana"),
            new RuleCollection([new RequiredFieldRule(violatorFields.firstName)]));

        controller.validate();

        expect(controller.getIssueCollection().getIssues()).toHaveLength(0);
    });

    /**
     * A rule reading only shared sections is evaluated against the first page alone, since every page holds the
     * same values there -- without it a required violator name would be reported once per violation on a citation,
     * all of them the same issue.
     */
    it("evaluates a shared rule once for the form and a per-page rule once per page", async () => {
        const controller = new RulesController(
            await addCitationPage(form),
            new RuleCollection([
                new RequiredFieldRule(violatorFields.driverLicenseNumber),
                new RequiredFieldRule(chargeFields.offenseDescription)
            ]));

        controller.validate();

        const issues = controller.getIssueCollection().getIssues();

        expect(issues).toHaveLength(3);
        expect(issues.filter(issue => issue.field.name === "driver-license-number")).toHaveLength(1);
        expect(issues.filter(issue => issue.field.name === "offense-description")).toHaveLength(2);
    });

    it("reports a per-page rule only for the pages that break it", async () => {
        let twoPages = await addCitationPage(form);
        twoPages = setFieldValue(twoPages, chargeSection, chargeFields.offenseDescription, "Speeding", 0);

        const controller = new RulesController(twoPages, new RuleCollection([new RequiredFieldRule(chargeFields.offenseDescription)]));

        controller.validate();

        expect(controller.getIssueCollection().getIssues()).toHaveLength(1);
    });

    it("raises onChanged when it validates", () => {
        const controller = new RulesController(form, new RuleCollection([new RequiredFieldRule(violatorFields.firstName)]));
        let raised = 0;
        controller.onChanged(() => { raised += 1; });

        controller.validate();

        expect(raised).toBe(1);
    });

    it("throws for a rule type that was never registered", () => {
        expect(() => new RulesController(form).getTypeByName("NoSuchRule")).toThrowError(/not found in the registry/);
    });

    it("adds a rule collection to the rules it already holds", () => {
        const controller = new RulesController(form, new RuleCollection([new RequiredFieldRule(violatorFields.firstName)]));

        controller.addRuleCollection(new RuleCollection([new RequiredFieldRule(violatorFields.dateOfBirth)]));

        expect(controller.getRuleCollection().getRules()).toHaveLength(2);
    });

    it("clears its issues when disposed", () => {
        const controller = new RulesController(form, new RuleCollection([new RequiredFieldRule(violatorFields.firstName)]));
        controller.validate();

        controller.dispose();

        expect(controller.getIssueCollection().getIssues()).toHaveLength(0);
    });
});
