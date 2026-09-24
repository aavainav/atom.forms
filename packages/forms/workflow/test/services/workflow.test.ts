import { beforeEach, describe, expect, it } from "vitest";
import { RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { IActor, IRuleIssue, IWorkflowStamp } from "@forms/core";

import { WorkflowService } from "../../src/services/workflow";
import { createForm, WorkflowStubForm } from "../fixtures/workflow-form";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };

const field = { name: "title", label: "Title", value: "" } as IRuleIssue["field"];
const noIssues = new RuleIssueCollection();
const withError = new RuleIssueCollection([{ field, message: "Required.", section: {}, severity: RuleIssueSeverity.error } as IRuleIssue]);
const withWarning = new RuleIssueCollection([{ field, message: "Short.", section: {}, severity: RuleIssueSeverity.warning } as IRuleIssue]);

/** A form as a reviewer finds it: submitted, and open to review rather than to editing. */
function inReview(form: WorkflowStubForm): WorkflowStubForm {
    return form.setStatus("inReview").setMode("reviewable");
}

describe("WorkflowService", () => {
    const service = new WorkflowService();
    let form: WorkflowStubForm;

    beforeEach(async () => {
        form = await createForm();
    });

    describe("getTransitions", () => {
        it("lists the transitions that can be made from the status and in the mode the form is in", () => {
            expect(service.getTransitions(form).map(available => available.id)).toEqual(["issue", "submit"]);
        });

        it("lists a transition's definition beside its id", () => {
            const [issue] = service.getTransitions(form);

            expect(issue.transition.title).toBe("Issue");
            expect(issue.transition.to).toBe("issued");
        });

        it("lists none of the transitions made in another mode, whatever the status", () => {
            expect(service.getTransitions(inReview(form)).map(available => available.id)).toEqual(["approve", "reject"]);
            expect(service.getTransitions(form.setStatus("inReview"))).toEqual([]);
        });

        it("lists none from a status no transition leaves", () => {
            expect(service.getTransitions(form.setStatus("approved"))).toEqual([]);
        });
    });

    describe("canTransition", () => {
        it("is true for a transition the form can make now", () => {
            expect(service.canTransition(form, "issue")).toBe(true);
        });

        it("is false for one made from another status, in another mode, or that does not exist", () => {
            expect(service.canTransition(form, "approve")).toBe(false);
            expect(service.canTransition(form.setStatus("inReview"), "approve")).toBe(false);
            expect(service.canTransition(form, "nowhere")).toBe(false);
        });
    });

    describe("transition", () => {
        it("leaves the form in the status the transition names", () => {
            expect(service.transition(form, "submit", officer, { issues: noIssues }).status).toBe("inReview");
        });

        it("keeps an entry for it in the history, saying who made it and when", () => {
            const moved = service.transition(form, "submit", officer, { at: 1000, issues: noIssues, note: "Ready for you." });

            expect(moved.history).toEqual([{ at: 1000, by: officer, from: "draft", note: "Ready for you.", to: "inReview", transition: "submit" }]);
        });

        it("keeps no note in the entry when it is given none", () => {
            const [entry] = service.transition(form, "submit", officer, { issues: noIssues, note: "" }).history;

            expect(entry).not.toHaveProperty("note");
        });

        it("stamps the time it is made at when it is not given one", () => {
            const before = Date.now();
            const [entry] = service.transition(form, "submit", officer, { issues: noIssues }).history;

            expect(entry.at).toBeGreaterThanOrEqual(before);
            expect(entry.at).toBeLessThanOrEqual(Date.now());
        });

        it("adds to the history rather than replacing it, so a report that is rejected and resubmitted keeps both", () => {
            const submitted = service.transition(form, "submit", officer, { at: 1, issues: noIssues });
            const rejected = service.transition(submitted.setMode("reviewable"), "reject", reviewer, { at: 2, issues: noIssues, openComments: 1 });
            const resubmitted = service.transition(rejected.setMode("editable"), "submit", officer, { at: 3, issues: noIssues });

            expect(resubmitted.history.map(entry => entry.transition)).toEqual(["submit", "reject", "submit"]);
            expect(resubmitted.history.map(entry => entry.by.id)).toEqual(["officer-1", "reviewer-1", "officer-1"]);
        });

        it("runs the transition's effect on the form before it moves", () => {
            const issued = service.transition(form, "issue", officer, { issues: noIssues });

            expect(issued.wasStamped).toBe(true);
            expect(issued.status).toBe("issued");
        });

        it("applies the lock of the status it leaves the form in", () => {
            expect(service.transition(form, "issue", officer, { issues: noIssues }).mode).toBe("viewable");
        });

        it("applies no lock for a status that has none", () => {
            expect(service.transition(form, "submit", officer, { issues: noIssues }).mode).toBe("editable");
        });

        it("leaves the form it is called on as it was", () => {
            service.transition(form, "issue", officer, { issues: noIssues });

            expect(form.status).toBe("draft");
            expect(form.history).toEqual([]);
            expect(form.mode).toBe("editable");
        });

        it("throws for a transition the form's workflow does not have", () => {
            expect(() => service.transition(form, "nowhere", officer, { issues: noIssues })).toThrowError('The form has no transition called "nowhere".');
        });

        it("throws when the form is in a status the transition is not made from", () => {
            expect(() => service.transition(form.setStatus("issued"), "issue", officer, { issues: noIssues })).toThrowError('"issue" cannot be made while the form is issued.');
        });

        it("throws when the form is not in the mode the transition is made in", () => {
            expect(() => service.transition(form.setStatus("inReview"), "approve", reviewer, { issues: noIssues })).toThrowError('"approve" can only be made while the form is reviewable.');
        });

        it("throws when the validation found an error, and leaves the form as it was", () => {
            expect(() => service.transition(form, "submit", officer, { issues: withError })).toThrowError('"submit" cannot be made while the form has validation errors.');
            expect(form.status).toBe("draft");
        });

        it("is not stopped by a warning", () => {
            expect(service.transition(form, "submit", officer, { issues: withWarning }).status).toBe("inReview");
        });

        it("is stopped by an error for every transition, rejecting included", () => {
            expect(() => service.transition(inReview(form), "reject", reviewer, { issues: withError, openComments: 2 })).toThrowError("validation errors");
            expect(() => service.transition(inReview(form), "approve", reviewer, { issues: withError })).toThrowError("validation errors");
        });

        it("throws for a transition that needs an open comment when there is none", () => {
            expect(() => service.transition(inReview(form), "reject", reviewer, { issues: noIssues })).toThrowError('"reject" needs at least one open comment.');
            expect(() => service.transition(inReview(form), "reject", reviewer, { issues: noIssues, openComments: 0 })).toThrowError("needs at least one open comment");
        });

        it("is made when there is an open comment", () => {
            expect(service.transition(inReview(form), "reject", reviewer, { issues: noIssues, openComments: 1 }).status).toBe("rejected");
        });

        it("needs no comment for a transition that does not ask for one", () => {
            expect(service.transition(inReview(form), "approve", reviewer, { issues: noIssues }).status).toBe("approved");
        });

        it("throws for a transition that needs no open comment when one is open", () => {
            expect(() => service.transition(form, "submit", officer, { issues: noIssues, openComments: 1 })).toThrowError('"submit" cannot be made while a comment is open.');
        });

        it("is made when there is no open comment", () => {
            expect(service.transition(form, "submit", officer, { issues: noIssues, openComments: 0 }).status).toBe("inReview");
            expect(service.transition(form, "submit", officer, { issues: noIssues }).status).toBe("inReview");
        });

        it("closes the whole form when the workflow says the status does", () => {
            expect(service.transition(inReview(form), "approve", reviewer, { issues: noIssues }).mode).toBe("viewable");
        });
    });

    describe("restoreWorkflow", () => {
        const stamp: IWorkflowStamp = {
            history: [{ at: 5, by: officer, from: "draft", to: "issued", transition: "issue" }],
            id: "test-workflow",
            version: "2"
        };

        it("gives the form the status it is given", () => {
            expect(service.restoreWorkflow(form, "inReview").status).toBe("inReview");
        });

        it("gives the form the history it is given, without keeping the array it was given", () => {
            const restored = service.restoreWorkflow(form, "issued", stamp);

            expect(restored.history).toEqual(stamp.history);
            expect(restored.history).not.toBe(stamp.history);
        });

        it("applies the lock of the status the form is restored to", () => {
            expect(service.restoreWorkflow(form, "issued", stamp).mode).toBe("viewable");
        });

        it("keeps the status the form has when it is not given one", () => {
            expect(service.restoreWorkflow(form).status).toBe("draft");
        });

        it("keeps the history of a record made under another workflow, rather than dropping what it cannot read", () => {
            const restored = service.restoreWorkflow(form, "issued", { ...stamp, id: "another-workflow", version: "9" });

            expect(restored.history).toEqual(stamp.history);
        });

        it("refuses a status no form can have, including a name an object has of its own", () => {
            expect(() => service.restoreWorkflow(form, "bogus" as never)).toThrowError('"bogus" is not a status a form can have.');
            expect(() => service.restoreWorkflow(form, "toString" as never)).toThrowError('"toString" is not a status a form can have.');
        });

        it("accepts every status a form can have", () => {
            const statuses = ["approved", "canceled", "draft", "inProgress", "inReview", "issued", "rejected", "voided"] as const;

            for (const status of statuses) {
                expect(service.restoreWorkflow(form, status).status).toBe(status);
            }
        });
    });

    describe("populate, then restoreWorkflow -- the two-step load", () => {
        it("reproduces what extractData published: the mapper has nothing to do here, so populate is a no-op and restoreWorkflow does the rest", async () => {
            const issued = service.transition(form, "issue", officer, { at: 7, issues: noIssues });
            const record = issued.extractData();

            const populated = await (await createForm()).populate({ data: record });
            const restored = service.restoreWorkflow(populated, record.status, record.workflow);

            expect(restored.status).toBe("issued");
            expect(restored.history).toEqual(issued.history);
            expect(restored.mode).toBe("viewable");
        });
    });
});
