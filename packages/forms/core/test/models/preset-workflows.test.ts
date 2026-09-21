import { describe, expect, it } from "vitest";

import type { IActor } from "../../src/models/actor";
import { citationWorkflow } from "../../src/models/citation-form";
import { crashWorkflow } from "../../src/models/crash-form";
import { noIssues, withError } from "../fixtures/workflow-form";
import { PresetCitationForm, PresetCrashForm } from "../fixtures/preset-forms";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };

describe("the citation workflow", () => {
    it("is the one a citation form carries, and is called citation", () => {
        expect(new PresetCitationForm().workflow).toBe(citationWorkflow);
        expect(citationWorkflow.id).toBe("citation");
    });

    it("lets a citation be issued from a draft, and from one in progress", () => {
        expect(citationWorkflow.transitions.issue.from).toEqual(["draft", "inProgress"]);
        expect(new PresetCitationForm().getTransitions().map(available => available.id)).toEqual(["issue"]);
        expect(new PresetCitationForm().setStatus("inProgress").canTransition("issue")).toBe(true);
    });

    it("stamps the date and time it was issued as it is issued", () => {
        const issued = new PresetCitationForm().transition("issue", officer, { issues: noIssues });

        expect(issued.stamped).toEqual(["date", "time"]);
        expect(issued.status).toBe("issued");
    });

    it("closes the whole form once it is issued, as a jurisdiction that lets nothing be changed after it needs", () => {
        const issued = new PresetCitationForm().transition("issue", officer, { issues: noIssues });

        expect(issued.mode).toBe("viewable");
        expect(issued.getTransitions()).toEqual([]);
    });

    it("cannot be issued while it has a validation error", () => {
        expect(() => new PresetCitationForm().transition("issue", officer, { issues: withError })).toThrowError("validation errors");
    });

    it("cannot be issued twice", () => {
        const issued = new PresetCitationForm().transition("issue", officer, { issues: noIssues });

        expect(() => issued.transition("issue", officer, { issues: noIssues })).toThrow();
    });

    it("is what a jurisdiction changes with `with`, without changing it for the others", () => {
        const custom = citationWorkflow.with({ id: "custom", locks: { issued: form => form } });

        expect(custom.transitions).toEqual(citationWorkflow.transitions);
        expect(custom.locks?.issued).not.toBe(citationWorkflow.locks?.issued);
        expect(citationWorkflow.id).toBe("citation");
    });
});

describe("the crash workflow", () => {
    it("is the one a crash form carries, and is called crash", () => {
        expect(new PresetCrashForm().workflow).toBe(crashWorkflow);
        expect(crashWorkflow.id).toBe("crash");
    });

    it("lets a report be submitted from a draft, in progress, or once rejected", () => {
        expect(crashWorkflow.transitions.submit.from).toEqual(["draft", "inProgress", "rejected"]);
        expect(new PresetCrashForm().getTransitions().map(available => available.id)).toEqual(["submit"]);
    });

    it("closes the report to its author once it is submitted", () => {
        const submitted = new PresetCrashForm().transition("submit", officer, { issues: noIssues });

        expect(submitted.status).toBe("inReview");
        expect(submitted.mode).toBe("viewable");
    });

    it("offers a reviewer approving and rejecting, and nothing else", () => {
        const inReview = new PresetCrashForm().transition("submit", officer, { issues: noIssues }).setMode("reviewable");

        expect(inReview.getTransitions().map(available => available.id)).toEqual(["approve", "reject"]);
    });

    it("cannot be rejected without an open comment, since a rejection is for fixing what the comments say", () => {
        const inReview = new PresetCrashForm().transition("submit", officer, { issues: noIssues }).setMode("reviewable");

        expect(() => inReview.transition("reject", reviewer, { issues: noIssues })).toThrowError('"reject" needs at least one open comment.');
        expect(inReview.transition("reject", reviewer, { issues: noIssues, openComments: 1 }).status).toBe("rejected");
    });

    it("can be approved without one, and is closed once it is", () => {
        const inReview = new PresetCrashForm().transition("submit", officer, { issues: noIssues }).setMode("reviewable");
        const approved = inReview.transition("approve", reviewer, { issues: noIssues });

        expect(approved.status).toBe("approved");
        expect(approved.mode).toBe("viewable");
        expect(approved.getTransitions()).toEqual([]);
    });

    it("can be submitted again after it is rejected, and keeps the whole history", () => {
        const submitted = new PresetCrashForm().transition("submit", officer, { at: 1, issues: noIssues });
        const rejected = submitted.setMode("reviewable").transition("reject", reviewer, { at: 2, issues: noIssues, openComments: 1 });
        const resubmitted = rejected.setMode("editable").transition("submit", officer, { at: 3, issues: noIssues });

        expect(resubmitted.status).toBe("inReview");
        expect(resubmitted.history.map(entry => `${entry.transition}:${entry.by.id}`)).toEqual(["submit:officer-1", "reject:reviewer-1", "submit:officer-1"]);
    });
});
