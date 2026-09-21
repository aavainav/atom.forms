import { beforeEach, describe, expect, it } from "vitest";
import { citationWorkflow, FormModel, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { FieldDefinition, FieldModel, IActor, IRuleIssue, SectionDefinition, SectionModel, TValueType } from "@forms/core";

import { S438FormModel } from "../../src/models/s438-form";
import { S438FormSchema } from "../../src/models/s438-form-schema";
import { createForm } from "../fixtures/form";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);
const officer: IActor = { id: "officer-1", name: "Officer One" };
const noIssues = new RuleIssueCollection();

/** Whether a field, on the front page at the given index, is open to editing. */
function isEnabled(form: S438FormModel, pageIndex: number, sectionDefinition: SectionDefinition<SectionModel>, fieldDefinition: FieldDefinition<FieldModel<TValueType>>): boolean {
    return form.getPagesFor(schema.frontPage)[pageIndex].get<SectionModel>(sectionDefinition).get<FieldModel<TValueType>>(fieldDefinition).getIsEnabled();
}

describe("the S438 workflow", () => {
    let form: S438FormModel;

    beforeEach(async () => {
        form = await createForm();
    });

    it("is South Carolina's own citation workflow, called sc-citation", () => {
        expect(form.workflow.id).toBe("sc-citation");
    });

    it("moves a citation as the citation workflow does, and closes it differently", () => {
        expect(form.workflow.transitions).toEqual(citationWorkflow.transitions);
        expect(form.workflow.locks?.issued).not.toBe(citationWorkflow.locks?.issued);
    });

    it("lets an officer issue a citation", () => {
        expect(form.getTransitions().map(available => available.id)).toEqual(["issue"]);
    });

    describe("once the citation is issued", () => {
        let issued: S438FormModel;

        beforeEach(() => {
            issued = form.transition("issue", officer, { issues: noIssues });
        });

        it("is in the issued status, and still editable rather than closed", () => {
            expect(issued.status).toBe("issued");
            expect(issued.mode).toBe("editable");
        });

        it("closes what the citation charges: the violations", () => {
            expect(issued.isSectionLocked(schema.violationSection)).toBe(true);
            expect(isEnabled(issued, 0, schema.violationSection, schema.violationFields.violationDescription)).toBe(false);
            expect(isEnabled(issued, 0, schema.violationSection, schema.violationFields.violationSectionNumber)).toBe(false);
        });

        it("closes where they were", () => {
            expect(issued.isSectionLocked(schema.violationLocationSection)).toBe(true);
            expect(isEnabled(issued, 0, schema.violationLocationSection, schema.violationLocationFields.violationLocation)).toBe(false);
        });

        it("leaves the rest of the citation open to the officer to correct", () => {
            expect(issued.isSectionLocked(schema.violatorSection)).toBe(false);
            expect(isEnabled(issued, 0, schema.violatorSection, schema.violatorFields.violatorFirstName)).toBe(true);
            expect(isEnabled(issued, 0, schema.vehicleSection, schema.vehicleFields.vehicleMake)).toBe(true);
            expect(isEnabled(issued, 0, schema.courtSection, schema.courtFields.courtName)).toBe(true);
        });

        it("closes the set of front pages, so a violation cannot be moved onto a page added or taken off one removed", async () => {
            const page = await schema.frontPage.createPage(issued).initialize();

            expect(issued.isPageSetLocked(schema.frontPage)).toBe(true);
            expect(() => issued.addPage(page, schema.frontPage)).toThrowError("cannot be added while they are locked");
            expect(() => issued.removePage(0, schema.frontPage)).toThrowError("cannot be removed while they are locked");
        });

        it("leaves the notice pages alone", () => {
            expect(issued.isPageSetLocked(schema.noticePage)).toBe(false);
        });

        it("has no transition left to make, since the court's taking it is the host's to say", () => {
            expect(issued.getTransitions()).toEqual([]);
        });

        it("records who issued it in the history the record carries", () => {
            const { workflow } = issued.extractData();

            expect(workflow?.id).toBe("sc-citation");
            expect(workflow?.history).toHaveLength(1);
            expect(workflow?.history[0]).toMatchObject({ by: officer, from: "draft", to: "issued", transition: "issue" });
        });
    });

    it("closes the violations on every front page of a citation that has more than one", async () => {
        const two = form.addPage(await schema.frontPage.createPage(form).initialize(), schema.frontPage);

        const issued = two.transition("issue", officer, { issues: noIssues });

        expect(isEnabled(issued, 0, schema.violationSection, schema.violationFields.violationDescription)).toBe(false);
        expect(isEnabled(issued, 1, schema.violationSection, schema.violationFields.violationDescription)).toBe(false);
        expect(isEnabled(issued, 1, schema.violatorSection, schema.violatorFields.violatorFirstName)).toBe(true);
    });

    it("cannot be issued while it has a validation error", () => {
        const issue: IRuleIssue = { field: form.getFirstField(schema.violatorFields.violatorFirstName), message: "Required.", section: schema.violatorSection, severity: RuleIssueSeverity.error };

        expect(() => form.transition("issue", officer, { issues: new RuleIssueCollection([issue]) })).toThrowError("validation errors");
    });

    describe("loading an issued citation", () => {
        it("closes the same parts again, so a saved record is no more open than the one that was issued", async () => {
            const record = form.transition("issue", officer, { at: 9, issues: noIssues }).extractData();

            const loaded = await (await createForm()).populate({ data: record, status: record.status, workflow: record.workflow }) as S438FormModel;

            expect(loaded.status).toBe("issued");
            expect(loaded.history).toHaveLength(1);
            expect(loaded.isSectionLocked(schema.violationSection)).toBe(true);
            expect(loaded.isPageSetLocked(schema.frontPage)).toBe(true);
            expect(isEnabled(loaded, 0, schema.violationSection, schema.violationFields.violationDescription)).toBe(false);
            expect(isEnabled(loaded, 0, schema.violatorSection, schema.violatorFields.violatorFirstName)).toBe(true);
        });

        it("leaves a citation that was not issued as open as it was", async () => {
            const record = form.extractData();

            const loaded = await (await createForm()).populate({ data: record, status: record.status, workflow: record.workflow }) as S438FormModel;

            expect(loaded.status).toBe("draft");
            expect(loaded.isSectionLocked(schema.violationSection)).toBe(false);
            expect(isEnabled(loaded, 0, schema.violationSection, schema.violationFields.violationDescription)).toBe(true);
        });
    });
});
