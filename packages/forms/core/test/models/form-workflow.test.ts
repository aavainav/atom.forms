import { beforeEach, describe, expect, it } from "vitest";

import type { IActor } from "../../src/models/actor";
import type { IFormMapper } from "../../src/mapping/form-mapper";
import type { IReportData } from "../../src/mapping/data/report-data";
import type { IWorkflowEntry, IWorkflowStamp } from "../../src/models/workflow";
import type { StringFieldModel } from "../../src/models/string-field";
import { FormModel } from "../../src/models/form";
import { PageCollection } from "../../src/models/page-collection";
import type { PageModel } from "../../src/models/page";
import { withChanges } from "../../src/utils/clone";
import { SectionModel } from "../../src/models/section";
import {
    addRecordPage, chargeFields, chargeSection, createWorkflowForm, headerFields, headerSection, isFieldEnabled, noIssues,
    recordPage, withError, withWarning
} from "../fixtures/workflow-form";
import type { WorkflowForm } from "../fixtures/workflow-form";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };

/** A form as a reviewer finds it: submitted, and open to review rather than to editing. */
function inReview(form: WorkflowForm): WorkflowForm {
    return form.setStatus("inReview").setMode("reviewable");
}

function getTitle(form: WorkflowForm): unknown {
    return form.get<PageCollection>(recordPage).getFirstPage<PageModel>().get<SectionModel>(headerSection).get<StringFieldModel>(headerFields.title).getValue();
}

describe("FormModel workflow", () => {
    let form: WorkflowForm;

    beforeEach(async () => {
        form = await createWorkflowForm();
    });

    describe("getTransitions", () => {
        it("lists the transitions that can be made from the status and in the mode the form is in", () => {
            expect(form.getTransitions().map(available => available.id)).toEqual(["issue", "submit"]);
        });

        it("lists a transition's definition beside its id", () => {
            const [issue] = form.getTransitions();

            expect(issue.transition.title).toBe("Issue");
            expect(issue.transition.to).toBe("issued");
        });

        it("lists none of the transitions made in another mode, whatever the status", () => {
            expect(inReview(form).getTransitions().map(available => available.id)).toEqual(["approve", "reject"]);
            expect(form.setStatus("inReview").getTransitions()).toEqual([]);
        });

        it("lists none from a status no transition leaves", () => {
            expect(form.setStatus("approved").getTransitions()).toEqual([]);
        });

        it("lists none for a form that has no workflow", () => {
            const bare = withChanges(form, { workflow: undefined });

            expect(bare.getTransitions()).toEqual([]);
        });
    });

    describe("canTransition", () => {
        it("is true for a transition the form can make now", () => {
            expect(form.canTransition("issue")).toBe(true);
        });

        it("is false for one made from another status, in another mode, or that does not exist", () => {
            expect(form.canTransition("approve")).toBe(false);
            expect(form.setStatus("inReview").canTransition("approve")).toBe(false);
            expect(form.canTransition("nowhere")).toBe(false);
        });
    });

    describe("transition", () => {
        it("leaves the form in the status the transition names", () => {
            expect(form.transition("submit", officer, { issues: noIssues }).status).toBe("inReview");
        });

        it("keeps an entry for it in the history, saying who made it and when", () => {
            const moved = form.transition("submit", officer, { at: 1000, issues: noIssues, note: "Ready for you." });

            expect(moved.history).toEqual([{ at: 1000, by: officer, from: "draft", note: "Ready for you.", to: "inReview", transition: "submit" }]);
        });

        it("keeps no note in the entry when it is given none", () => {
            const [entry] = form.transition("submit", officer, { issues: noIssues, note: "" }).history;

            expect(entry).not.toHaveProperty("note");
        });

        it("stamps the time it is made at when it is not given one", () => {
            const before = Date.now();
            const [entry] = form.transition("submit", officer, { issues: noIssues }).history;

            expect(entry.at).toBeGreaterThanOrEqual(before);
            expect(entry.at).toBeLessThanOrEqual(Date.now());
        });

        it("adds to the history rather than replacing it, so a report that is rejected and resubmitted keeps both", () => {
            const submitted = form.transition("submit", officer, { at: 1, issues: noIssues });
            const rejected = withChanges(submitted, { mode: "reviewable" }).transition("reject", reviewer, { at: 2, issues: noIssues, openComments: 1 });
            const resubmitted = withChanges(rejected, { mode: "editable" }).transition("submit", officer, { at: 3, issues: noIssues });

            expect(resubmitted.history.map(entry => entry.transition)).toEqual(["submit", "reject", "submit"]);
            expect(resubmitted.history.map(entry => entry.by.id)).toEqual(["officer-1", "reviewer-1", "officer-1"]);
        });

        it("runs the transition's effect on the form before it moves", () => {
            const issued = form.transition("issue", officer, { issues: noIssues });

            expect(getTitle(issued)).toBe("Issued");
            expect(issued.status).toBe("issued");
        });

        it("applies the lock of the status it leaves the form in", () => {
            const issued = form.transition("issue", officer, { issues: noIssues });

            expect(issued.isSectionLocked(chargeSection)).toBe(true);
            expect(issued.isPageSetLocked(recordPage)).toBe(true);
            expect(isFieldEnabled(issued, 0, chargeSection, chargeFields.offense)).toBe(false);
            expect(isFieldEnabled(issued, 0, headerSection, headerFields.title)).toBe(true);
        });

        it("applies no lock for a status that has none", () => {
            const submitted = form.transition("submit", officer, { issues: noIssues });

            expect(submitted.isSectionLocked(chargeSection)).toBe(false);
            expect(submitted.isPageSetLocked(recordPage)).toBe(false);
        });

        it("leaves the form it is called on as it was", () => {
            form.transition("issue", officer, { issues: noIssues });

            expect(form.status).toBe("draft");
            expect(form.history).toEqual([]);
            expect(form.isSectionLocked(chargeSection)).toBe(false);
            expect(getTitle(form)).toBe("");
        });

        it("throws for a transition the form's workflow does not have", () => {
            expect(() => form.transition("nowhere", officer, { issues: noIssues })).toThrowError('The form has no transition called "nowhere".');
        });

        it("throws for every transition when the form has no workflow", () => {
            expect(() => withChanges(form, { workflow: undefined }).transition("submit", officer, { issues: noIssues })).toThrowError('The form has no transition called "submit".');
        });

        it("throws when the form is in a status the transition is not made from", () => {
            expect(() => form.setStatus("issued").transition("issue", officer, { issues: noIssues })).toThrowError('"issue" cannot be made while the form is issued.');
        });

        it("throws when the form is not in the mode the transition is made in", () => {
            expect(() => form.setStatus("inReview").transition("approve", reviewer, { issues: noIssues })).toThrowError('"approve" can only be made while the form is reviewable.');
        });

        it("throws when the validation found an error, and leaves the form as it was", () => {
            expect(() => form.transition("submit", officer, { issues: withError })).toThrowError('"submit" cannot be made while the form has validation errors.');
            expect(form.status).toBe("draft");
        });

        it("is not stopped by a warning", () => {
            expect(form.transition("submit", officer, { issues: withWarning }).status).toBe("inReview");
        });

        it("is stopped by an error for every transition, rejecting included", () => {
            expect(() => inReview(form).transition("reject", reviewer, { issues: withError, openComments: 2 })).toThrowError("validation errors");
            expect(() => inReview(form).transition("approve", reviewer, { issues: withError })).toThrowError("validation errors");
        });

        it("throws for a transition that needs an open comment when there is none", () => {
            expect(() => inReview(form).transition("reject", reviewer, { issues: noIssues })).toThrowError('"reject" needs at least one open comment.');
            expect(() => inReview(form).transition("reject", reviewer, { issues: noIssues, openComments: 0 })).toThrowError("needs at least one open comment");
        });

        it("is made when there is an open comment", () => {
            const rejected = inReview(form).transition("reject", reviewer, { issues: noIssues, openComments: 1 });

            expect(rejected.status).toBe("rejected");
        });

        it("needs no comment for a transition that does not ask for one", () => {
            expect(inReview(form).transition("approve", reviewer, { issues: noIssues }).status).toBe("approved");
        });

        it("throws for a transition that needs no open comment when one is open", () => {
            expect(() => form.transition("submit", officer, { issues: noIssues, openComments: 1 })).toThrowError('"submit" cannot be made while a comment is open.');
        });

        it("is made when there is no open comment", () => {
            expect(form.transition("submit", officer, { issues: noIssues, openComments: 0 }).status).toBe("inReview");
            expect(form.transition("submit", officer, { issues: noIssues }).status).toBe("inReview");
        });

        it("closes the whole form when the workflow says the status does", () => {
            const approved = inReview(form).transition("approve", reviewer, { issues: noIssues });

            expect(approved.mode).toBe("viewable");
            expect(isFieldEnabled(approved, 0, headerSection, headerFields.title)).toBe(false);
        });
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

    describe("restoreWorkflow", () => {
        const stamp: IWorkflowStamp = {
            history: [{ at: 5, by: officer, from: "draft", to: "issued", transition: "issue" }],
            id: "test-workflow",
            version: "2"
        };

        it("gives the form the status it is given", () => {
            expect(form.restoreWorkflow("inReview").status).toBe("inReview");
        });

        it("gives the form the history it is given, without keeping the array it was given", () => {
            const restored = form.restoreWorkflow("issued", stamp);

            expect(restored.history).toEqual(stamp.history);
            expect(restored.history).not.toBe(stamp.history);
        });

        it("applies the lock of the status the form is restored to", () => {
            const restored = form.restoreWorkflow("issued", stamp);

            expect(restored.isSectionLocked(chargeSection)).toBe(true);
            expect(isFieldEnabled(restored, 0, chargeSection, chargeFields.offense)).toBe(false);
            expect(restored.isPageSetLocked(recordPage)).toBe(true);
        });

        it("keeps the status the form has when it is not given one", () => {
            expect(form.restoreWorkflow().status).toBe("draft");
        });

        it("keeps the history of a record made under another workflow, rather than dropping what it cannot read", () => {
            const restored = form.restoreWorkflow("issued", { ...stamp, id: "another-workflow", version: "9" });

            expect(restored.history).toEqual(stamp.history);
        });

        it("refuses a status no form can have, including a name an object has of its own", () => {
            expect(() => form.restoreWorkflow("bogus" as never)).toThrowError('"bogus" is not a status a form can have.');
            expect(() => form.restoreWorkflow("toString" as never)).toThrowError('"toString" is not a status a form can have.');
        });

        it("accepts every status a form can have", () => {
            const statuses = ["approved", "canceled", "draft", "inProgress", "inReview", "issued", "rejected", "voided"] as const;

            for (const status of statuses) {
                expect(form.restoreWorkflow(status).status).toBe(status);
            }
        });
    });

    describe("populate", () => {
        const data = { name: "test-workflow", status: "issued", type: "none", version: "1" } as unknown as IReportData;
        const history: ReadonlyArray<IWorkflowEntry> = [{ at: 5, by: officer, from: "draft", to: "issued", transition: "issue" }];

        it("restores the status and history of the record it is given, and the lock the status carries", () => {
            const populated = form.populate({ data, status: "issued", workflow: { history, id: "test-workflow", version: "2" } }) as WorkflowForm;

            expect(populated.status).toBe("issued");
            expect(populated.history).toEqual(history);
            expect(populated.isSectionLocked(chargeSection)).toBe(true);
        });

        it("keeps the status the form was built with when the record has none", () => {
            const populated = form.populate({ data }) as WorkflowForm;

            expect(populated.status).toBe("draft");
            expect(populated.history).toEqual([]);
        });

        it("answers directly when the form has nothing to await", () => {
            expect(form.populate({ data, status: "issued" })).not.toBeInstanceOf(Promise);
        });

        it("restores it after a mapper that answers with a promise, as a form of repeating pages does", async () => {
            const mapper: IFormMapper<FormModel<any>, any> = { extract: () => ({}), populate: async populated => populated };
            const mapped = withChanges(form, { mapper });

            const populated = await mapped.populate({ data, status: "issued", workflow: { history, id: "test-workflow", version: "2" } });

            expect(populated.status).toBe("issued");
            expect(populated.history).toEqual(history);
            expect(populated.isSectionLocked(chargeSection)).toBe(true);
        });

        it("refuses a record whose status is not one a form can have", () => {
            expect(() => form.populate({ data, status: "bogus" as never })).toThrowError('"bogus" is not a status a form can have.');
        });
    });

    describe("extractData", () => {
        it("stamps the workflow's id and version on the record, with the history so far", () => {
            const submitted = form.transition("submit", officer, { at: 1, issues: noIssues });

            expect(submitted.extractData().workflow).toEqual({
                history: [{ at: 1, by: officer, from: "draft", to: "inReview", transition: "submit" }],
                id: "test-workflow",
                version: "2"
            });
        });

        it("stamps an empty history on a form that has made no transition", () => {
            expect(form.extractData().workflow).toEqual({ history: [], id: "test-workflow", version: "2" });
        });

        it("leaves the workflow off a record whose form has none", () => {
            expect(withChanges(form, { workflow: undefined }).extractData()).not.toHaveProperty("workflow");
        });

        it("comes back as it went: what a form extracts is what a form populates", () => {
            const issued = form.transition("issue", officer, { at: 7, issues: noIssues });
            const record = issued.extractData();

            return createWorkflowForm().then(fresh => {
                const restored = fresh.populate({ data: record, status: record.status, workflow: record.workflow }) as WorkflowForm;

                expect(restored.status).toBe("issued");
                expect(restored.history).toEqual(issued.history);
                expect(restored.isSectionLocked(chargeSection)).toBe(true);
            });
        });
    });
});
