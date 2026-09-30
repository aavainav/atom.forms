import type { BooleanFieldModel } from "../../boolean-field";
import type { FieldDefinition } from "../../field-definition";
import type { IRuleContext } from "../rule-context";
import type { PageDefinition } from "../../page-definition";
import { IRule, Rule } from "../rule";
import { RegisterRule } from "../rules-controller";
import { IRuleIssue, RuleIssueSeverity } from "../rule-issue";

/** Defines a validation rule that requires a number of fields in a group of checkboxes to be selected -- at least one, unless it says otherwise. */
export interface IRequiredSelectionRule extends IRule {
    /** The definition of the field the issue is reported against. */
    readonly anchorFieldDefinition: FieldDefinition<BooleanFieldModel>;
    /** The definitions of the fields making up the group. */
    readonly fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>;
    /** How many of the group must be selected. */
    readonly minimum: number;
}

/**
 * Represents a validation rule that requires a number of fields in a group of checkboxes to be selected -- at
 * least one, unless it says otherwise.
 */
@RegisterRule(RequiredSelectionRule.name)
export class RequiredSelectionRule extends Rule implements IRequiredSelectionRule {
    static readonly defaultMessage = "At least one option must be selected.";

    readonly anchorFieldDefinition: FieldDefinition<BooleanFieldModel>;
    readonly fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>;
    readonly minimum: number;

    constructor(
        anchorFieldDefinition: FieldDefinition<BooleanFieldModel>,
        fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>,
        message?: string,
        severity?: RuleIssueSeverity,
        minimum: number = 1) {
        super(RequiredSelectionRule.name, message ?? RequiredSelectionRule.defaultMessage, severity);

        if (fieldDefinitions.length === 0) {
            throw new Error("A required selection rule requires at least one field definition.");
        }

        if (!Number.isInteger(minimum) || minimum < 1 || minimum > fieldDefinitions.length) {
            throw new Error(`A required selection rule's minimum must be a whole number from 1 to the ${fieldDefinitions.length} fields in its group.`);
        }

        this.anchorFieldDefinition = anchorFieldDefinition;
        this.fieldDefinitions = fieldDefinitions;
        this.minimum = minimum;
    }

    public getPageDefinition(): PageDefinition {
        return this.anchorFieldDefinition.getPageDefinition();
    }

    /** The group is shared only when every field in it is, since one per-page field makes the selection differ per page. */
    public isShared(): boolean {
        return this.fieldDefinitions.every(fieldDefinition => fieldDefinition.getSectionDefinition().isShared);
    }

    /** Creates a rule that requires at least `minimum` of the group to be selected. */
    public static atLeast(
        anchorFieldDefinition: FieldDefinition<BooleanFieldModel>,
        fieldDefinitions: ReadonlyArray<FieldDefinition<BooleanFieldModel>>,
        minimum: number,
        message?: string,
        severity?: RuleIssueSeverity): RequiredSelectionRule {
        return new RequiredSelectionRule(anchorFieldDefinition, fieldDefinitions, message, severity, minimum);
    }

    protected evaluate(context: IRuleContext): Array<IRuleIssue> {
        const selected = this.fieldDefinitions.filter(fieldDefinition => context.getField(fieldDefinition)?.getValue() === true).length;
        if (selected >= this.minimum) {
            return [];
        }

        const anchor = context.getField(this.anchorFieldDefinition);

        return anchor
            ? [{ field: anchor, section: this.anchorFieldDefinition.getSectionDefinition(), message: this.message, severity: this.severity }]
            : [];
    }
}
