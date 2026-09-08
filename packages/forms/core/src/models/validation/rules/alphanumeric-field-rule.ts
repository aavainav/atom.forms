import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { IPatternFieldRule, PatternFieldRule } from "./pattern-field-rule";
import { RegisterRule } from "../rules-controller";
import { RuleViolationSeverity } from "../rule-violation";

/** Defines a validation rule that restricts a field's value to letters and numbers. */
export interface IAlphanumericFieldRule extends IPatternFieldRule {
}

/** Represents a validation rule that restricts a field's value to letters and numbers. */
@RegisterRule(AlphanumericFieldRule.name)
export class AlphanumericFieldRule extends PatternFieldRule implements IAlphanumericFieldRule {
    static readonly defaultMessage = "This field may only contain letters and numbers.";
    static readonly pattern = /^[A-Za-z0-9]*$/;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, message?: string, severity?: RuleViolationSeverity) {
        super(fieldDefinition, AlphanumericFieldRule.pattern, message ?? AlphanumericFieldRule.defaultMessage, severity);
    }
}
