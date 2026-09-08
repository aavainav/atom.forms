import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { FieldRule, IFieldRule } from "../field-rule";
import { RegisterRule } from "../rules-controller";
import { IRuleViolation, RuleViolationSeverity } from "../rule-violation";

/** Defines a validation rule that enforces a regular expression against a field's value. */
export interface IPatternFieldRule extends IFieldRule {
    /** The pattern the field's value must match. */
    readonly pattern: RegExp;
}

/** Represents a validation rule that enforces a regular expression against a field's value. */
@RegisterRule(PatternFieldRule.name)
export class PatternFieldRule extends FieldRule implements IPatternFieldRule {
    // annotated rather than inferred, so a derived rule can declare a default message of its own.
    static readonly defaultMessage: string = "This field is not in the expected format.";

    readonly pattern: RegExp;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, pattern: RegExp, message?: string, severity?: RuleViolationSeverity) {
        // `new.target` is the constructor that was actually invoked, so a derived rule registers under its own name.
        super(new.target.name, fieldDefinition, message ?? PatternFieldRule.defaultMessage, severity);

        // a global pattern carries `lastIndex` between calls, and a rule is reused across every instance of its field.
        this.pattern = pattern.global ? new RegExp(pattern.source, pattern.flags.replace("g", "")) : pattern;
    }

    protected validateField(field: FieldModel<TValueType>): Array<IRuleViolation> {
        // an empty value is the required rule's concern, not the pattern's.
        if (field.getIsEmpty()) {
            return [];
        }

        if (!this.pattern.test(String(field.getValue()))) {
            return [{ field: field, message: this.message, severity: this.severity }];
        }

        return [];
    }
}
