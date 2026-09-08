import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { FieldRule, IFieldRule } from "../field-rule";
import { RegisterRule } from "../rules-controller";
import { IRuleViolation, RuleViolationSeverity } from "../rule-violation";

/** Defines a validation rule that enforces a minimum and maximum length constraint on a field's value. */
export interface IMaxLengthFieldRule extends IFieldRule {
    /** The minimum allowed length of the field's value. */
    readonly minimumLength: number;
    /** The maximum allowed length of the field's value. */
    readonly maximumLength: number;
}

/** Represents a validation rule that enforces a minimum and maximum length constraint on a field's value. */
@RegisterRule(MaxLengthFieldRule.name)
export class MaxLengthFieldRule extends FieldRule implements IMaxLengthFieldRule  {
    static readonly defaultMessage = "This field exceeds the maximum length of {maxLength} char(s).";
    readonly minimumLength: number;
    readonly maximumLength: number;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, minimumLength: number, maximumLength: number, message?: string, severity?: RuleViolationSeverity) {
        super(MaxLengthFieldRule.name, fieldDefinition, message ?? MaxLengthFieldRule.defaultMessage, severity);

        this.minimumLength = minimumLength;
        this.maximumLength = maximumLength;
    }

    protected validateField(field: FieldModel<TValueType>): Array<IRuleViolation> {
        const valueLength = (field.value as string)?.length ?? 0;

        if (valueLength < this.minimumLength || valueLength > this.maximumLength) {
            return [{ field: field, message: this.message.replace("{maxLength}", this.maximumLength.toString()), severity: this.severity }];
        }

        return [];
    }
}
