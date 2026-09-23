import { beforeEach, describe, expect, it } from "vitest";
import { RuleIssueCollection } from "@forms/core";
import type { IActor } from "@forms/core";
import { WorkflowService } from "@forms/workflow";

import { PublicContactOrWarningFormModel } from "../../src/models/public-contact-or-warning-form";
import { createForm } from "../fixtures/form";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const noIssues = new RuleIssueCollection();
const service = new WorkflowService();

describe("the public contact or warning form", () => {
    let form: PublicContactOrWarningFormModel;

    beforeEach(async () => {
        form = await createForm();
    });

    it("carries the warning workflow", () => {
        expect(form.workflow.id).toBe("warning");
    });

    it("lets an officer issue it", () => {
        expect(service.getTransitions(form).map(available => available.id)).toEqual(["issue"]);
    });

    it("keeps the workflow in its record", () => {
        expect(form.extractData()).toHaveProperty("workflow");
    });

    describe("once it is issued", () => {
        let issued: PublicContactOrWarningFormModel;

        beforeEach(() => {
            issued = service.transition(form, "issue", officer, { issues: noIssues });
        });

        it("is in the issued status, and closed to further editing", () => {
            expect(issued.status).toBe("issued");
            expect(issued.mode).toBe("viewable");
        });

        it("has no transition left to make", () => {
            expect(service.getTransitions(issued)).toEqual([]);
        });

        it("records who issued it in the history the record carries", () => {
            const { workflow } = issued.extractData();

            expect(workflow?.id).toBe("warning");
            expect(workflow?.history).toHaveLength(1);
            expect(workflow?.history[0]).toMatchObject({ by: officer, from: "draft", to: "issued", transition: "issue" });
        });
    });
});
