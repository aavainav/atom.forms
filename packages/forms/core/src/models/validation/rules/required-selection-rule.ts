import type { BooleanFieldModel } from "../../boolean-field";
import type { FieldDefinition } from "../../field-definition";
import type { IRuleContext } from "../rule-context";
import type { PageDefinition } from "../../page-definition";
import { IRule, Rule } from "../rule";
import { RegisterRule } from "../rules-controller";
import { IRuleIssue, RuleIssueSeverity } from "../rule-issue";

/** Defines a validation rule that requires at least one field in a group of checkboxes to be selected. */
export interface IRequiredSelectionRule extends IRule {
    /** The definition of the field the issue is reported against. */
    readonly anchorFieldDefinition: FieldDefinition<BooleanFieldModel>;
    /** The definitions of the fields making up the group, at least one of which must be selected. */
    readonly fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>;
}

/**
 * Represents a validation rule that requires at least one field in a group of checkboxes to be selected.
 *
 * The issue is reported once, against the anchor field, rather than against every field in the group, so that
 * an unanswered group of twenty checkboxes does not mark the whole section as being in error.
 */
@RegisterRule(RequiredSelectionRule.name)
export class RequiredSelectionRule extends Rule implements IRequiredSelectionRule {
    static readonly defaultMessage = "At least one option must be selected.";

    readonly anchorFieldDefinition: FieldDefinition<BooleanFieldModel>;
    readonly fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>;

    constructor(
        anchorFieldDefinition: FieldDefinition<BooleanFieldModel>,
        fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>,
        message?: string,
        severity?: RuleIssueSeverity) {
        super(RequiredSelectionRule.name, message ?? RequiredSelectionRule.defaultMessage, severity);

        if (fieldDefinitions.length === 0) {
            throw new Error("A required selection rule requires at least one field definition.");
        }

        this.anchorFieldDefinition = anchorFieldDefinition;
        this.fieldDefinitions = fieldDefinitions;
    }

    public getPageDefinition(): PageDefinition {
        return this.anchorFieldDefinition.getPageDefinition();
    }

    /** The group is shared only when every field in it is, since one per-page field makes the selection differ per page. */
    public isShared(): boolean {
        return this.fieldDefinitions.every(fieldDefinition => fieldDefinition.getSectionDefinition().isShared);
    }

    protected evaluate(context: IRuleContext): Array<IRuleIssue> {
        const isSelected = this.fieldDefinitions.some(fieldDefinition => context.getField(fieldDefinition)?.getValue() === true);
        if (isSelected) {
            return [];
        }

        const anchor = context.getField(this.anchorFieldDefinition);

        return anchor ? [{ field: anchor, message: this.message, severity: this.severity }] : [];
    }
}
