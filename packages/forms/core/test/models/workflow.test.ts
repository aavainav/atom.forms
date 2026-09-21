import { describe, expect, it } from "vitest";

import { defineWorkflow } from "../../src/models/workflow";
import type { IWorkflowDefinition, WorkflowStep } from "../../src/models/workflow";

const definition: IWorkflowDefinition = {
    id: "citation",
    locks: { issued: form => form.setMode("viewable") },
    transitions: {
        issue: { from: ["draft", "inProgress"], mode: "editable", title: "Issue", to: "issued" },
        void: { from: ["issued"], mode: "editable", title: "Void", to: "voided" }
    },
    version: "1"
};

describe("defineWorkflow", () => {
    it("makes a workflow of what it is given", () => {
        const workflow = defineWorkflow(definition);

        expect(workflow.id).toBe("citation");
        expect(workflow.version).toBe("1");
        expect(Object.keys(workflow.transitions)).toEqual(["issue", "void"]);
        expect(workflow.locks?.issued).toBe(definition.locks!.issued);
    });

    it("refuses a transition that is made from no status, which could never be made", () => {
        expect(() => defineWorkflow({ ...definition, transitions: { stuck: { from: [], mode: "editable", title: "Stuck", to: "issued" } } }))
            .toThrowError('The transition "stuck" of the workflow "citation" must be made from at least one status.');
    });

    it("cannot be changed once it is made, since one is shared by every form that uses it", () => {
        const workflow = defineWorkflow(definition);

        expect(Object.isFrozen(workflow)).toBe(true);
        expect(() => { (workflow as { version: string }).version = "2"; }).toThrow();
    });

    describe("with", () => {
        const preset = defineWorkflow(definition);

        it("makes a workflow the same as the one it is called on, except for what it is given", () => {
            const changed = preset.with({ id: "sc-citation", version: "2" });

            expect(changed.id).toBe("sc-citation");
            expect(changed.version).toBe("2");
            expect(Object.keys(changed.transitions)).toEqual(["issue", "void"]);
            expect(changed.locks?.issued).toBe(definition.locks!.issued);
        });

        it("replaces a lock it is given a new one for, and keeps the others", () => {
            const twoLocks = defineWorkflow({ ...definition, locks: { approved: form => form.setMode("viewable"), issued: form => form.setMode("viewable") } });
            const replacement: WorkflowStep = form => form;

            const changed = twoLocks.with({ locks: { issued: replacement } });

            expect(changed.locks?.issued).toBe(replacement);
            expect(changed.locks?.approved).toBe(twoLocks.locks?.approved);
        });

        it("replaces a transition it is given a new one for, and keeps the others", () => {
            const replacement = { from: ["draft"], mode: "editable", title: "Issue now", to: "issued" } as const;

            const changed = preset.with({ transitions: { issue: replacement } });

            expect(changed.transitions.issue).toBe(replacement);
            expect(changed.transitions.void).toBe(definition.transitions.void);
        });

        it("adds a transition or a lock the workflow did not have", () => {
            const added = preset.with({ locks: { voided: form => form.setMode("viewable") }, transitions: { cancel: { from: ["draft"], mode: "editable", title: "Cancel", to: "canceled" } } });

            expect(Object.keys(added.transitions)).toEqual(["issue", "void", "cancel"]);
            expect(Object.keys(added.locks!)).toEqual(["issued", "voided"]);
        });

        it("leaves the workflow it is called on as it was", () => {
            preset.with({ id: "sc-citation", locks: { issued: form => form }, transitions: { issue: { from: ["draft"], mode: "editable", title: "Issue", to: "issued" } } });

            expect(preset.id).toBe("citation");
            expect(preset.locks?.issued).toBe(definition.locks!.issued);
            expect(preset.transitions.issue.from).toEqual(["draft", "inProgress"]);
        });

        it("makes a workflow that can be changed again, and that is frozen and checked as any other is", () => {
            const changed = preset.with({ id: "first" }).with({ id: "second" });

            expect(changed.id).toBe("second");
            expect(Object.isFrozen(changed)).toBe(true);
            expect(() => preset.with({ transitions: { stuck: { from: [], mode: "editable", title: "Stuck", to: "issued" } } })).toThrow("must be made from at least one status");
        });
    });
});
