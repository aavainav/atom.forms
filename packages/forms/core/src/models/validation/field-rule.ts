import type { FieldModel, TValueType } from "../field";
import type { FieldDefinition } from "../field-definition";
import type { IRuleContext } from "./rule-context";
import type { PageDefinition } from "../page-definition";
import { IRule, Rule } from "./rule";
import { IRuleIssue, RuleIssueSeverity } from "./rule-issue";

/** Defines a validation rule that validates a single field. */
export interface IFieldRule extends IRule {
    /** The definition of the field this rule validates. */
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;
}

/** Represents an abstract validation rule that validates the single field it is bound to. */
export abstract class FieldRule extends Rule implements IFieldRule {
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;

    constructor(name: string, fieldDefinition: FieldDefinition<FieldModel<TValueType>>, message?: string, severity?: RuleIssueSeverity) {
        super(name, message, severity);

        this.fieldDefinition = fieldDefinition;
    }

    public getPageDefinition(): PageDefinition {
        return this.fieldDefinition.getPageDefinition();
    }

    public isShared(): boolean {
        return this.fieldDefinition.getSectionDefinition().isShared;
    }

    protected evaluate(context: IRuleContext): Array<IRuleIssue> {
        const field = context.getField(this.fieldDefinition);
        if (!field) {
            return [];
        }

        const section = this.fieldDefinition.getSectionDefinition();
        return this.validateField(field).map(issue => ({ ...issue, section }));
    }

    /** Validates the field this rule is bound to, returning any resulting issues; `evaluate` attaches `section` once this returns. */
    protected abstract validateField(field: FieldModel<TValueType>): Array<Omit<IRuleIssue, "section">>;
}
