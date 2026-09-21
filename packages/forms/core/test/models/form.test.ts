import { beforeEach, describe, expect, it } from "vitest";

import type { FieldModel, TValueType } from "../../src/models/field";
import type { PageCollection } from "../../src/models/page-collection";
import type { SectionModel } from "../../src/models/section";
import type { StringFieldModel } from "../../src/models/string-field";
import { RequiredFieldRule } from "../../src/models/validation/rules/required-field-rule";
import { RuleCollection } from "../../src/models/validation/rule-collection";
import { RuleIssueCollection } from "../../src/models/validation/rule-issue-collection";
import { RuleIssueSeverity } from "../../src/models/validation/rule-issue";
import {
    addCitationPage,
    chargeFields,
    chargeSection,
    citationPage,
    createTestForm,
    getFieldValue,
    setFieldValue,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../fixtures/citation-form";
import { pageDefinition as foreignPageDefinition, foreignField } from "../fixtures/foreign-form";

describe("FormModel", () => {
    let form: TestCitationForm;

    beforeEach(async () => {
        form = await createTestForm();
    });

    /** Collects one field across every page of the citation. */
    function readAll(fieldDefinition: typeof chargeFields.offenseDescription): Array<StringFieldModel> {
        return form
            .getPages()
            .map(page => page.get<SectionModel>(chargeSection).get<StringFieldModel>(fieldDefinition));
    }

    describe("initialize", () => {
        it("creates a page for each page definition", () => {
            expect(form.getPages()).toHaveLength(1);
            expect(form.get<PageCollection>(citationPage).pages).toHaveLength(1);
        });

        it("names the page after its definition", () => {
            expect(form.getPages()[0].name).toBe("citation");
        });

        it("creates every field on every section, at its type's default", () => {
            expect(getFieldValue(form, violatorSection, violatorFields.firstName).getValue()).toBe("");
            expect(getFieldValue(form, chargeSection, chargeFields.fineAmount).getValue()).toBe(0);
        });
    });

    describe("addPage and removePage", () => {
        it("returns a new form with the page appended", async () => {
            const withTwo = await addCitationPage(form);

            expect(withTwo).not.toBe(form);
            expect(withTwo.getPages()).toHaveLength(2);
            expect(form.getPages()).toHaveLength(1);
        });

        it("returns a new form with the page removed", async () => {
            const withTwo = await addCitationPage(form);

            expect(withTwo.removePage(0, citationPage).getPages()).toHaveLength(1);
            expect(withTwo.getPages()).toHaveLength(2);
        });
    });

    describe("getFields and getFirstField", () => {
        it("groups a field by the page it belongs to", async () => {
            const withTwo = await addCitationPage(form);

            const fields = withTwo.getFields(chargeFields.offenseDescription);

            expect(fields.size).toBe(2);
            expect([...fields.values()].every(entry => entry.length === 1)).toBe(true);
        });

        it("answers the first field across the pages", () => {
            expect(form.getFirstField(violatorFields.firstName).name).toBe("first-name");
        });

        /**
         * `getFields` throws for a field the form cannot reach, unlike `getPagesFor`, which answers an empty
         * array. The two throws come from different places: a definition belonging to another form never resolves
         * in the entity's own values, so `Entity.get` rejects it before `getFields` reaches its own guard.
         */
        it("throws for a field belonging to another form's page", () => {
            expect(() => form.getFields(foreignField)).toThrowError(/A field was not found for definition/);
        });

        it("throws its own guard for a page it owns but holds no instances of", () => {
            // a form that has not been initialized holds an empty collection for each of its page definitions
            expect(() => new TestCitationForm().getFields(chargeFields.offenseDescription))
                .toThrowError("Page collection is missing or empty for citation.");
        });
    });

    describe("getPagesFor", () => {
        /**
         * This returns an empty array rather than throwing so that validating a rule bound to a page the form has
         * no instances of skips the rule instead of aborting the whole run.
         */
        it("answers an empty array for a page definition the form does not own", () => {
            expect(form.getPagesFor(foreignPageDefinition)).toEqual([]);
        });

        it("answers the pages of a definition the form does own", () => {
            expect(form.getPagesFor(citationPage)).toHaveLength(1);
        });
    });

    describe("validate", () => {
        it("marks only the fields carrying an error-severity issue", async () => {
            let withTwo = await addCitationPage(form);
            withTwo = setFieldValue(withTwo, chargeSection, chargeFields.offenseDescription, "Speeding", 0);

            const emptyOnSecondPage = withTwo
                .getPages()[1]
                .get<SectionModel>(chargeSection)
                .get<StringFieldModel>(chargeFields.offenseDescription);

            form = withTwo.validate(new RuleIssueCollection([
                { field: emptyOnSecondPage, section: chargeSection, message: "This field is required.", severity: RuleIssueSeverity.error }
            ]));

            expect(readAll(chargeFields.offenseDescription).map(field => field.getHasError())).toEqual([false, true]);
        });

        it("leaves a warning-severity issue without marking the field", () => {
            const field = getFieldValue(form, violatorSection, violatorFields.firstName);

            const validated = form.validate(new RuleIssueCollection([
                { field, section: violatorSection, message: "Check this.", severity: RuleIssueSeverity.warning }
            ]));

            expect(getFieldValue(validated, violatorSection, violatorFields.firstName).getHasError()).toBe(false);
        });

        it("clears an error once the issue is gone", () => {
            const field = getFieldValue(form, violatorSection, violatorFields.firstName);
            const errored = form.validate(new RuleIssueCollection([
                { field, section: violatorSection, message: "This field is required.", severity: RuleIssueSeverity.error }
            ]));

            const cleared = errored.validate(new RuleIssueCollection());

            expect(getFieldValue(cleared, violatorSection, violatorFields.firstName).getHasError()).toBe(false);
        });
    });

    describe("setMode", () => {
        it.each(["reviewable", "viewable"] as const)("disables every field on every page when switching to %s", async (mode) => {
            const withTwo = await addCitationPage(form);

            const locked = withTwo.setMode(mode);

            const enabled = locked
                .getPages()
                .flatMap(page => [violatorSection, chargeSection]
                    .flatMap(section => page.get<SectionModel>(section)
                        .getChildDefinitions()
                        .map(definition => page.get<SectionModel>(section).get<FieldModel<TValueType>>(definition).getIsEnabled())));

            expect(enabled).not.toHaveLength(0);
            expect(enabled.every(value => value === false)).toBe(true);
            expect(locked.mode).toBe(mode);
        });

        it.each(["reviewable", "viewable"] as const)("stamps editable over %s without re-enabling fields disabled for another reason", (mode) => {
            const locked = form.setMode(mode);

            const editable = locked.setMode("editable");

            expect(editable.mode).toBe("editable");
            expect(getFieldValue(editable, violatorSection, violatorFields.firstName).getIsEnabled()).toBe(false);
        });
    });

    describe("setStatus", () => {
        it("returns a new form carrying the status", () => {
            const issued = form.setStatus("issued");

            expect(issued).not.toBe(form);
            expect(issued.status).toBe("issued");
            expect(form.status).toBe("draft");
        });
    });

    describe("addRuleCollection", () => {
        it("returns a new form whose rules include the ones added, leaving the original alone", () => {
            const rule = new RequiredFieldRule(violatorFields.firstName);

            const withRules = form.addRuleCollection(new RuleCollection([rule]));

            expect(withRules).not.toBe(form);
            expect(withRules.getRuleCollection().getRules()).toEqual([rule]);
            expect(form.getRuleCollection().getRules()).toHaveLength(0);
        });
    });
});
