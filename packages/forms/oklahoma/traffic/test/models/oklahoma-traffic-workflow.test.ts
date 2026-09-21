import { describe, expect, it } from "vitest";
import { citationWorkflow, RuleIssueCollection } from "@forms/core";
import type { IActor } from "@forms/core";

import type { OKTrafficFormModel } from "../../src/models/traffic-form";
import { createForm } from "../fixtures/form";

const officer: IActor = { id: "officer-1", name: "Officer One" };
const issues = new RuleIssueCollection();

describe("the Oklahoma traffic workflow", () => {
    it("is the citation workflow, which closes the whole citation once it is issued", async () => {
        expect((await createForm()).workflow).toBe(citationWorkflow);
    });

    it("lets an officer issue a citation, and closes it", async () => {
        const issued = (await createForm()).transition("issue", officer, { issues });

        expect(issued.status).toBe("issued");
        expect(issued.mode).toBe("viewable");
        expect(issued.getTransitions()).toEqual([]);
    });

    it("carries who issued it in the record, under the workflow it was issued by", async () => {
        const { workflow } = (await createForm()).transition("issue", officer, { at: 4, issues }).extractData();

        expect(workflow?.id).toBe("citation");
        expect(workflow?.history).toEqual([{ at: 4, by: officer, from: "draft", to: "issued", transition: "issue" }]);
    });

    it("loads an issued record closed, as it was issued", async () => {
        const record = (await createForm()).transition("issue", officer, { issues }).extractData();

        const loaded = await (await createForm()).populate({ data: record, status: record.status, workflow: record.workflow }) as OKTrafficFormModel;

        expect(loaded.status).toBe("issued");
        expect(loaded.mode).toBe("viewable");
        expect(loaded.history).toHaveLength(1);
    });
});
