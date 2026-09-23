import { beforeEach, describe, expect, it } from "vitest";

import type { IActor } from "../../src/models/actor";
import type { IFormMapper } from "../../src/mapping/form-mapper";
import type { IWorkflowEntry } from "../../src/models/workflow";
import { FormModel } from "../../src/models/form";
import { withChanges } from "../../src/utils/clone";
import {
    addRecordPage, chargeFields, chargeSection, createWorkflowForm, headerFields, headerSection, isFieldEnabled, recordPage
} from "../fixtures/workflow-form";
import type { WorkflowForm } from "../fixtures/workflow-form";

const officer: IActor = { id: "officer-1", name: "Officer One" };

/**
 * `FormModel`'s own share of workflow behaviour: the generic lock primitives, and stamping a workflow's id, version
 * and history onto extracted data. Interpreting a workflow -- which transitions it offers now, and what making one
 * changes -- is `@forms/workflow`'s `WorkflowService`, tested there against this same shape of fixture.
 */
describe("FormModel workflow", () => {
    let form: WorkflowForm;

    beforeEach(async () => {
        form = await createWorkflowForm();
    });

    describe("lockSection", () => {
        it("closes the fields of the section and no others", () => {
            const locked = form.lockSection(chargeSection);

            expect(isFieldEnabled(locked, 0, chargeSection, chargeFields.offense)).toBe(false);
            expect(isFieldEnabled(locked, 0, headerSection, headerFields.title)).toBe(true);
        });

        it("closes the section on every page of the form", async () => {
            const locked = (await addRecordPage(form)).lockSection(chargeSection);

            expect(isFieldEnabled(locked, 0, chargeSection, chargeFields.offense)).toBe(false);
            expect(isFieldEnabled(locked, 1, chargeSection, chargeFields.offense)).toBe(false);
        });

        it("closes the section on a page added afterwards, and leaves the rest of that page open", async () => {
            const added = await addRecordPage(form.lockSection(chargeSection));

            expect(isFieldEnabled(added, 1, chargeSection, chargeFields.offense)).toBe(false);
            expect(isFieldEnabled(added, 1, headerSection, headerFields.title)).toBe(true);
        });

        it("is what isSectionLocked reports, for that section only", () => {
            const locked = form.lockSection(chargeSection);

            expect(locked.isSectionLocked(chargeSection)).toBe(true);
            expect(locked.isSectionLocked(headerSection)).toBe(false);
            expect(form.isSectionLocked(chargeSection)).toBe(false);
        });

        it("leaves the form it is called on as it was", () => {
            form.lockSection(chargeSection);

            expect(isFieldEnabled(form, 0, chargeSection, chargeFields.offense)).toBe(true);
        });

        it("does not close the form, which stays in the mode it was in", () => {
            expect(form.lockSection(chargeSection).mode).toBe("editable");
        });
    });

    describe("lockPageSet", () => {
        it("is what isPageSetLocked reports", () => {
            expect(form.isPageSetLocked(recordPage)).toBe(false);
            expect(form.lockPageSet(recordPage).isPageSetLocked(recordPage)).toBe(true);
        });

        it("refuses a page to be added, saying which pages are locked", async () => {
            const locked = form.lockPageSet(recordPage);

            await expect(addRecordPage(locked)).rejects.toThrowError("Pages of record cannot be added while they are locked.");
        });

        it("refuses a page to be removed", async () => {
            const locked = (await addRecordPage(form)).lockPageSet(recordPage);

            expect(() => locked.removePage(1, recordPage)).toThrowError("Pages of record cannot be removed while they are locked.");
        });

        it("leaves the fields open, since it closes the structure and nothing in it", () => {
            const locked = form.lockPageSet(recordPage);

            expect(isFieldEnabled(locked, 0, headerSection, headerFields.title)).toBe(true);
            expect(isFieldEnabled(locked, 0, chargeSection, chargeFields.offense)).toBe(true);
        });

        it("lets pages be added and removed when the set is not locked", async () => {
            const added = await addRecordPage(form);

            expect(added.getPagesFor(recordPage)).toHaveLength(2);
            expect(added.removePage(1, recordPage).getPagesFor(recordPage)).toHaveLength(1);
        });
    });

    describe("populate", () => {
        it("returns the form unchanged when it has no mapper", () => {
            expect(form.populate({ data: {} as never })).toBe(form);
        });

        it("no longer restores status or workflow history on its own -- that is @forms/workflow's restoreWorkflow now", () => {
            const populated = form.populate({
                data: {} as never,
                status: "issued",
                workflow: { history: [{ at: 1, by: officer, from: "draft", to: "issued", transition: "issue" }], id: "test-workflow", version: "2" }
            }) as WorkflowForm;

            expect(populated.status).toBe("draft");
            expect(populated.history).toEqual([]);
        });

        it("runs the mapper when the form has one, awaiting it when it answers with a promise", async () => {
            const mapper: IFormMapper<FormModel<any>, any> = { extract: () => ({}), populate: async populated => populated };
            const mapped = withChanges(form, { mapper });

            await expect(mapped.populate({ data: {} as never })).resolves.toBe(mapped);
        });

        it("answers directly when the mapper has nothing to await", () => {
            const mapper: IFormMapper<FormModel<any>, any> = { extract: () => ({}), populate: populated => populated };
            const mapped = withChanges(form, { mapper });

            expect(mapped.populate({ data: {} as never })).not.toBeInstanceOf(Promise);
        });
    });

    describe("extractData", () => {
        const entry: IWorkflowEntry = { at: 1, by: officer, from: "draft", to: "inReview", transition: "submit" };

        it("stamps the workflow's id and version on the record, with the history so far", () => {
            expect(withChanges(form, { history: [entry] }).extractData().workflow).toEqual({ history: [entry], id: "test-workflow", version: "2" });
        });

        it("stamps an empty history on a form that has made no transition", () => {
            expect(form.extractData().workflow).toEqual({ history: [], id: "test-workflow", version: "2" });
        });

        it("leaves the workflow off a record whose form has none", () => {
            expect(withChanges(form, { workflow: undefined }).extractData()).not.toHaveProperty("workflow");
        });
    });
});
