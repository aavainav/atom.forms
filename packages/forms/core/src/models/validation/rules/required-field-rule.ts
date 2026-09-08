import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { FieldRule, IFieldRule } from "../field-rule";
import { RegisterRule } from "../rules-controller";
import { IRuleViolation, RuleViolationSeverity } from "../rule-violation";

/** Defines a validation rule that ensures a field is not empty. */
export interface IRequiredFieldRule extends IFieldRule {
}

/** Represents a validation rule that ensures a field is not empty. */
@RegisterRule(RequiredFieldRule.name)
export class RequiredFieldRule extends FieldRule implements IRequiredFieldRule  {
    static readonly defaultMessage = "This field is required.";

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, message?: string, severity?: RuleViolationSeverity) {
        super(RequiredFieldRule.name, fieldDefinition, message ?? RequiredFieldRule.defaultMessage, severity);
    }

    protected validateField(field: FieldModel<TValueType>): Array<IRuleViolation> {
        if (field.getIsEmpty()) {
            return [{ field: field, message: this.message, severity: this.severity }];
        }

        return [];
    }
}
