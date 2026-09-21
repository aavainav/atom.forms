import { describe, expect, it } from "vitest";
import { crashWorkflow, RuleIssueCollection } from "@forms/core";
import type { IActor } from "@forms/core";

import type { TR310FormModel } from "../../src/models/tr310-form";
import { createForm } from "../fixtures/form";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };
const issues = new RuleIssueCollection();

describe("the TR-310 workflow", () => {
    it("is the crash workflow", async () => {
        expect((await createForm()).workflow).toBe(crashWorkflow);
    });

    it("lets an officer submit the report, which closes it to them", async () => {
        const submitted = (await createForm()).transition("submit", officer, { issues });

        expect(submitted.status).toBe("inReview");
        expect(submitted.mode).toBe("viewable");
    });

    it("lets a reviewer approve it, or reject it with a comment", async () => {
        const inReview = (await createForm()).transition("submit", officer, { issues }).setMode("reviewable");

        expect(inReview.getTransitions().map(available => available.id)).toEqual(["approve", "reject"]);
        expect(() => inReview.transition("reject", reviewer, { issues })).toThrowError("needs at least one open comment");
        expect(inReview.transition("reject", reviewer, { issues, openComments: 1 }).status).toBe("rejected");
        expect(inReview.transition("approve", reviewer, { issues }).status).toBe("approved");
    });

    it("carries every step in the record, under the workflow it was made by", async () => {
        const submitted = (await createForm()).transition("submit", officer, { at: 1, issues });
        const approved = submitted.setMode("reviewable").transition("approve", reviewer, { at: 2, issues });
        const { workflow } = approved.extractData();

        expect(workflow?.id).toBe("crash");
        expect(workflow?.history.map(entry => `${entry.transition}:${entry.by.id}`)).toEqual(["submit:officer-1", "approve:reviewer-1"]);
    });

    it("loads a report that is in review closed, as it was submitted", async () => {
        const record = (await createForm()).transition("submit", officer, { issues }).extractData();

        const loaded = await (await createForm()).populate({ data: record, status: record.status, workflow: record.workflow }) as TR310FormModel;

        expect(loaded.status).toBe("inReview");
        expect(loaded.mode).toBe("viewable");
    });
});
