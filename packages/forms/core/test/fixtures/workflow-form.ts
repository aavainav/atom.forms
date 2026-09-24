import type { IField } from "../../src/models/field";
import type { FieldDefinition } from "../../src/models/field-definition";
import type { FieldModel, TValueType } from "../../src/models/field";
import type { SectionDefinition } from "../../src/models/section-definition";
import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { PageCollection } from "../../src/models/page-collection";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";
import { RuleIssueSeverity } from "../../src/models/validation/rule-issue";
import { RuleIssueCollection } from "../../src/models/validation/rule-issue-collection";
import { defineWorkflow } from "../../src/models/workflow";
import type { IWorkflow } from "../../src/models/workflow";

/**
 * A form that carries a workflow, over the smallest tree that shows what a workflow's locks do: one repeating page
 * holding a header section and a charge section. Its definitions are built once, at module scope, and its model
 * classes are its own, for the reasons the citation fixture gives.
 */
export class WorkflowForm extends FormModel<any> {
    public readonly workflow: IWorkflow = testWorkflow;
}
export class WorkflowPage extends PageModel { }
export class HeaderSection extends SectionModel { }
export class ChargeSection extends SectionModel { }

export const workflowFormDefinition = DefinitionFactory.form("test-workflow", WorkflowForm, {});
export const recordPage = DefinitionFactory.page("record", workflowFormDefinition, WorkflowPage);

export const headerSection = DefinitionFactory.section("header", recordPage, HeaderSection);
export const chargeSection = DefinitionFactory.section("charge", recordPage, ChargeSection);

export const headerFields = defineFields(headerSection, {
    title: { label: "Title", ctor: StringFieldModel }
});

export const chargeFields = defineFields(chargeSection, {
    offense: { label: "Offense", ctor: StringFieldModel }
});

/** Returns the form with the title on its first page set, which is what issuing does as it is made. */
function setTitle(form: WorkflowForm, value: string): WorkflowForm {
    const collection = form.get<PageCollection>(recordPage);
    const page = collection.getFirstPage<WorkflowPage>();
    const section = page.get<HeaderSection>(headerSection);
    const field = section.get<StringFieldModel>(headerFields.title).setValue(value);

    return form.set(recordPage, collection.replace(0, page.set(headerSection, section.set(headerFields.title, field))));
}

/**
 * Four transitions, one of each kind: one that runs an effect, one that needs an open comment, one that needs none
 * open, and one made in a different mode. Approving closes the whole form; issuing closes the charge and the adding
 * of pages, and no more.
 */
export const testWorkflow: IWorkflow = defineWorkflow({
    id: "test-workflow",
    locks: {
        approved: form => form.setMode("viewable"),
        issued: form => form.lockPageSet(recordPage).lockSection(chargeSection)
    },
    transitions: {
        approve: { from: ["inReview"], guards: ["noOpenComments"], icon: "check2-circle", mode: "reviewable", title: "Approve", to: "approved" },
        issue: { effect: form => setTitle(form as WorkflowForm, "Issued"), from: ["draft"], icon: "check2-circle", mode: "editable", title: "Issue", to: "issued" },
        reject: { from: ["inReview"], guards: ["hasOpenComments"], icon: "x-circle", mode: "reviewable", title: "Reject", to: "rejected" },
        submit: { from: ["draft", "rejected"], guards: ["noOpenComments"], icon: "send", mode: "editable", title: "Submit", to: "inReview" }
    },
    version: "2"
});

/** Builds a fresh form with its page created. */
export function createWorkflowForm(): Promise<WorkflowForm> {
    return new WorkflowForm().initialize();
}

/** Returns a form with a second record page appended. */
export async function addRecordPage(form: WorkflowForm): Promise<WorkflowForm> {
    return form.addPage(await recordPage.createPage(form).initialize(), recordPage);
}

/** Whether a field, on the page at the given index, is open to editing. */
export function isFieldEnabled(form: FormModel<any>, pageIndex: number, sectionDefinition: SectionDefinition<SectionModel>, fieldDefinition: FieldDefinition<FieldModel<TValueType>>): boolean {
    return form.getPagesFor(recordPage)[pageIndex].get<SectionModel>(sectionDefinition).get<FieldModel<TValueType>>(fieldDefinition).getIsEnabled();
}

/** What validating found nothing wrong looks like. */
export const noIssues = new RuleIssueCollection();

const field = { name: "title", label: "Title", value: "" } as IField;

/** A validation result holding an error. */
export const withError = new RuleIssueCollection([{ field, message: "Title is required.", section: headerSection, severity: RuleIssueSeverity.error }]);

/** A validation result holding only a warning, which is not enough to stop a transition. */
export const withWarning = new RuleIssueCollection([{ field, message: "Title is short.", section: headerSection, severity: RuleIssueSeverity.warning }]);
