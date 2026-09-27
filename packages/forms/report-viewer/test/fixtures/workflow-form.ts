import { defineWorkflow, IFormMapper, IReportData, FormDefinition, FormModel } from "@forms/core";

/**
 * A form with no pages and a small workflow: submit it, then approve it or reject it with a comment. `mapper` is read
 * off a static slot rather than passed to the constructor, since a form model's constructor takes no arguments; a test
 * that saves the form sets the slot first, and resets it after.
 */
export class WorkflowStubForm extends FormModel<any> {
    static mapper: IFormMapper<WorkflowStubForm, IReportData> | undefined = undefined;
    public readonly mapper: IFormMapper<WorkflowStubForm, IReportData> | undefined = WorkflowStubForm.mapper;

    public readonly workflow = defineWorkflow({
        id: "stub-workflow",
        transitions: {
            approve: { from: ["inReview"], guards: ["noOpenComments"], icon: "check2-circle", mode: "reviewable", title: "Approve", to: "approved" },
            reject: { from: ["inReview"], guards: ["hasOpenComments"], icon: "x-circle", mode: "reviewable", title: "Reject", to: "rejected" },
            submit: { from: ["draft", "rejected"], guards: ["noOpenComments"], icon: "send", mode: "editable", title: "Submit for review", to: "inReview" }
        },
        version: "1"
    });
}

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
new FormDefinition("workflow-stub-form", WorkflowStubForm, {});
