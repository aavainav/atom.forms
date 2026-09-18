import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { FieldRule, IFieldRule } from "../field-rule";
import { RegisterRule } from "../rules-controller";
import { IRuleIssue, RuleIssueSeverity } from "../rule-issue";

/** Defines a validation rule that enforces a minimum and maximum numeric value on a field. */
export interface INumberRangeFieldRule extends IFieldRule {
    /** The smallest value the field may hold. */
    readonly minimum: number;
    /** The largest value the field may hold. */
    readonly maximum: number;
}

/** Represents a validation rule that enforces a minimum and maximum numeric value on a field. */
@RegisterRule(NumberRangeFieldRule.name)
export class NumberRangeFieldRule extends FieldRule implements INumberRangeFieldRule {
    static readonly defaultMessage = "This field is not within the allowed range of values.";

    readonly minimum: number;
    readonly maximum: number;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, minimum: number, maximum: number, message?: string, severity?: RuleIssueSeverity) {
        super(NumberRangeFieldRule.name, fieldDefinition, message ?? NumberRangeFieldRule.defaultMessage, severity);

        this.minimum = minimum;
        this.maximum = maximum;
    }

    protected validateField(field: FieldModel<TValueType>): Array<Omit<IRuleIssue, "section">> {
        // an empty value is the required rule's concern, and a non-numeric one the format rule's.
        if (field.getIsEmpty()) {
            return [];
        }

        const value = Number(field.getValue());
        if (Number.isNaN(value)) {
            return [];
        }

        if (value < this.minimum || value > this.maximum) {
            return [{ field: field, message: this.message, severity: this.severity }];
        }

        return [];
    }
}
