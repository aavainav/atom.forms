import { defineWorkflow, withChanges, FormDefinition, FormModel } from "@forms/core";
import type { IWorkflow } from "@forms/core";

/**
 * A form with no pages and four transitions, one of each kind: one that runs an effect, one that needs an open
 * comment, one that needs none open, and one made in a different mode. Approving and issuing both close the form.
 */
export class WorkflowStubForm extends FormModel<any> {
    public readonly workflow: IWorkflow = testWorkflow;
    public readonly wasStamped: boolean = false;
}

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
new FormDefinition("workflow-stub-form", WorkflowStubForm, {});

export const testWorkflow: IWorkflow = defineWorkflow({
    id: "test-workflow",
    locks: {
        approved: form => form.setMode("viewable"),
        issued: form => form.setMode("viewable")
    },
    transitions: {
        approve: { from: ["inReview"], icon: "check2-circle", mode: "reviewable", title: "Approve", to: "approved" },
        issue: { effect: form => withChanges(form as WorkflowStubForm, { wasStamped: true }), from: ["draft"], icon: "check2-circle", mode: "editable", title: "Issue", to: "issued" },
        reject: { from: ["inReview"], guards: ["hasOpenComments"], icon: "x-circle", mode: "reviewable", title: "Reject", to: "rejected" },
        submit: { from: ["draft", "rejected"], guards: ["noOpenComments"], icon: "send", mode: "editable", title: "Submit", to: "inReview" }
    },
    version: "2"
});

/** Builds a fresh stub form. */
export function createForm(): Promise<WorkflowStubForm> {
    return new WorkflowStubForm().initialize();
}
