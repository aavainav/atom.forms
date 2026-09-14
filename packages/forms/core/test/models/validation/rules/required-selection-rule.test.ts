import { describe, expect, it } from "vitest";

import { BooleanFieldModel } from "../../../../src/models/boolean-field";
import { DefinitionFactory, defineFields } from "../../../../src/models/definition-factory";
import { FormModel } from "../../../../src/models/form";
import { PageModel } from "../../../../src/models/page";
import { RequiredSelectionRule } from "../../../../src/models/validation/rules/required-selection-rule";
import { SectionModel } from "../../../../src/models/section";
import { stubRuleContextFor } from "../../../fixtures/rule-context";

/**
 * A checkbox group needs several boolean fields, and one of them per-page, so this file builds its own tree
 * rather than bending the shared fixture around it. Unique subclasses, built once -- see the fixture's header.
 */
class SelectionTestForm extends FormModel { }
class SelectionTestPage extends PageModel { }
class SelectionTestSharedSection extends SectionModel { }
class SelectionTestPageSection extends SectionModel { }

const formDefinition = DefinitionFactory.form("selection-test", SelectionTestForm, {});
const pageDefinition = DefinitionFactory.page("violations", formDefinition, SelectionTestPage);
const sharedSection = DefinitionFactory.section("conditions", pageDefinition, SelectionTestSharedSection, { isShared: true });
const pageSection = DefinitionFactory.section("charge", pageDefinition, SelectionTestPageSection);

const conditions = defineFields(sharedSection, {
    isClear: { label: "Clear", ctor: BooleanFieldModel },
    isFoggy: { label: "Foggy", ctor: BooleanFieldModel },
    isRaining: { label: "Raining", ctor: BooleanFieldModel }
});

const charge = defineFields(pageSection, {
    isSpeedingRelated: { label: "Speeding related", ctor: BooleanFieldModel }
});

function checkbox(name: string, checked: boolean): BooleanFieldModel {
    return new BooleanFieldModel({ label: name, name, value: "" }).setValue(checked);
}

describe("RequiredSelectionRule", () => {
    const rule = new RequiredSelectionRule(conditions.isClear, [conditions.isClear, conditions.isFoggy, conditions.isRaining]);

    function context(clear: boolean, foggy: boolean, raining: boolean) {
        return stubRuleContextFor([
            [conditions.isClear, checkbox("is-clear", clear)],
            [conditions.isFoggy, checkbox("is-foggy", foggy)],
            [conditions.isRaining, checkbox("is-raining", raining)]
        ]);
    }

    it("reports nothing when one of the group is selected", () => {
        expect(rule.validate(context(false, true, false))).toHaveLength(0);
    });

    it("reports nothing when several of the group are selected", () => {
        expect(rule.validate(context(true, true, false))).toHaveLength(0);
    });

    /** An unanswered group of twenty checkboxes should not mark twenty fields as being in error. */
    it("reports once, against the anchor, when none of the group is selected", () => {
        const issues = rule.validate(context(false, false, false));

        expect(issues).toHaveLength(1);
        expect(issues[0].field.name).toBe("is-clear");
        expect(issues[0].message).toBe("At least one option must be selected.");
    });

    it("reports nothing when the context cannot resolve the anchor", () => {
        expect(rule.validate(stubRuleContextFor([]))).toHaveLength(0);
    });

    it("refuses to be built without any fields", () => {
        expect(() => new RequiredSelectionRule(conditions.isClear, []))
            .toThrowError("A required selection rule requires at least one field definition.");
    });

    it("answers the page its anchor belongs to", () => {
        expect(rule.getPageDefinition()).toBe(pageDefinition);
    });

    /** One per-page field in the group makes the selection differ per page, so the group is no longer shared. */
    it("is shared only when every field in the group is", () => {
        expect(rule.isShared()).toBe(true);

        expect(new RequiredSelectionRule(conditions.isClear, [conditions.isClear, charge.isSpeedingRelated]).isShared())
            .toBe(false);
    });
});
