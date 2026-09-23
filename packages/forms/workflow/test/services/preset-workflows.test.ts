import { describe, expect, it } from "vitest";
import { citationWorkflow, crashWorkflow, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import type { IActor, IRuleIssue } from "@forms/core";

import { WorkflowService } from "../../src/services/workflow";
import { PresetCitationForm, PresetCrashForm } from "../fixtures/preset-forms";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };

const field = { name: "title", label: "Title", value: "" } as unknown as IRuleIssue["field"];
const noIssues = new RuleIssueCollection();
const withError = new RuleIssueCollection([{ field, message: "Required.", section: {}, severity: RuleIssueSeverity.error } as unknown as IRuleIssue]);

describe("the citation workflow", () => {
    const service = new WorkflowService();

    it("is the one a citation form carries, and is called citation", () => {
        expect(new PresetCitationForm().workflow).toBe(citationWorkflow);
        expect(citationWorkflow.id).toBe("citation");
    });

    it("lets a citation be issued from a draft, and from one in progress", () => {
        expect(citationWorkflow.transitions.issue.from).toEqual(["draft", "inProgress"]);
        expect(service.getTransitions(new PresetCitationForm()).map(available => available.id)).toEqual(["issue"]);
        expect(service.canTransition(new PresetCitationForm().setStatus("inProgress"), "issue")).toBe(true);
    });

    it("stamps the date and time it was issued as it is issued", () => {
        const issued = service.transition(new PresetCitationForm(), "issue", officer, { issues: noIssues });

        expect(issued.stamped).toEqual(["date", "time"]);
        expect(issued.status).toBe("issued");
    });

    it("closes the whole form once it is issued, as a jurisdiction that lets nothing be changed after it needs", () => {
        const issued = service.transition(new PresetCitationForm(), "issue", officer, { issues: noIssues });

        expect(issued.mode).toBe("viewable");
        expect(service.getTransitions(issued)).toEqual([]);
    });

    it("cannot be issued while it has a validation error", () => {
        expect(() => service.transition(new PresetCitationForm(), "issue", officer, { issues: withError })).toThrowError("validation errors");
    });

    it("cannot be issued twice", () => {
        const issued = service.transition(new PresetCitationForm(), "issue", officer, { issues: noIssues });

        expect(() => service.transition(issued, "issue", officer, { issues: noIssues })).toThrow();
    });

    it("is what a jurisdiction changes with `with`, without changing it for the others", () => {
        const custom = citationWorkflow.with({ id: "custom", locks: { issued: form => form } });

        expect(custom.transitions).toEqual(citationWorkflow.transitions);
        expect(custom.locks?.issued).not.toBe(citationWorkflow.locks?.issued);
        expect(citationWorkflow.id).toBe("citation");
    });
});

describe("the crash workflow", () => {
    const service = new WorkflowService();

    it("is the one a crash form carries, and is called crash", () => {
        expect(new PresetCrashForm().workflow).toBe(crashWorkflow);
        expect(crashWorkflow.id).toBe("crash");
    });

    it("lets a report be submitted from a draft, in progress, or once rejected", () => {
        expect(crashWorkflow.transitions.submit.from).toEqual(["draft", "inProgress", "rejected"]);
        expect(service.getTransitions(new PresetCrashForm()).map(available => available.id)).toEqual(["submit"]);
    });

    it("closes the report to its author once it is submitted", () => {
        const submitted = service.transition(new PresetCrashForm(), "submit", officer, { issues: noIssues });

        expect(submitted.status).toBe("inReview");
        expect(submitted.mode).toBe("viewable");
    });

    it("offers a reviewer approving and rejecting, and nothing else", () => {
        const inReview = service.transition(new PresetCrashForm(), "submit", officer, { issues: noIssues }).setMode("reviewable");

        expect(service.getTransitions(inReview).map(available => available.id)).toEqual(["approve", "reject"]);
    });

    it("cannot be rejected without an open comment, since a rejection is for fixing what the comments say", () => {
        const inReview = service.transition(new PresetCrashForm(), "submit", officer, { issues: noIssues }).setMode("reviewable");

        expect(() => service.transition(inReview, "reject", reviewer, { issues: noIssues })).toThrowError('"reject" needs at least one open comment.');
        expect(service.transition(inReview, "reject", reviewer, { issues: noIssues, openComments: 1 }).status).toBe("rejected");
    });

    it("can be approved without one, and is closed once it is", () => {
        const inReview = service.transition(new PresetCrashForm(), "submit", officer, { issues: noIssues }).setMode("reviewable");
        const approved = service.transition(inReview, "approve", reviewer, { issues: noIssues });

        expect(approved.status).toBe("approved");
        expect(approved.mode).toBe("viewable");
        expect(service.getTransitions(approved)).toEqual([]);
    });

    it("can be submitted again after it is rejected, and keeps the whole history", () => {
        const submitted = service.transition(new PresetCrashForm(), "submit", officer, { at: 1, issues: noIssues });
        const rejected = service.transition(submitted.setMode("reviewable"), "reject", reviewer, { at: 2, issues: noIssues, openComments: 1 });
        const resubmitted = service.transition(rejected.setMode("editable"), "submit", officer, { at: 3, issues: noIssues });

        expect(resubmitted.status).toBe("inReview");
        expect(resubmitted.history.map(entry => `${entry.transition}:${entry.by.id}`)).toEqual(["submit:officer-1", "reject:reviewer-1", "submit:officer-1"]);
    });

    it("cannot be submitted again while a comment is still open, since the officer must address it first", () => {
        const submitted = service.transition(new PresetCrashForm(), "submit", officer, { issues: noIssues });
        const rejected = service.transition(submitted.setMode("reviewable"), "reject", reviewer, { issues: noIssues, openComments: 1 }).setMode("editable");

        expect(() => service.transition(rejected, "submit", officer, { issues: noIssues, openComments: 1 })).toThrowError('"submit" cannot be made while a comment is open.');
        expect(service.transition(rejected, "submit", officer, { issues: noIssues, openComments: 0 }).status).toBe("inReview");
    });
});
