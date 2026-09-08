import type { FieldModel, TValueType } from "../field";
import type { FieldDefinition } from "../field-definition";
import type { IRuleContext } from "./rule-context";
import type { PageDefinition } from "../page-definition";
import { IRule, Rule } from "./rule";
import { IRuleViolation, RuleViolationSeverity } from "./rule-violation";

/** Defines a validation rule that validates a single field. */
export interface IFieldRule extends IRule {
    /** The definition of the field this rule validates. */
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;
}

/** Represents an abstract validation rule that validates the single field it is bound to. */
export abstract class FieldRule extends Rule implements IFieldRule {
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;

    constructor(name: string, fieldDefinition: FieldDefinition<FieldModel<TValueType>>, message?: string, severity?: RuleViolationSeverity) {
        super(name, message, severity);

        this.fieldDefinition = fieldDefinition;
    }

    public getPageDefinition(): PageDefinition {
        return this.fieldDefinition.getPageDefinition();
    }

    protected evaluate(context: IRuleContext): Array<IRuleViolation> {
        const field = context.getField(this.fieldDefinition);

        return field ? this.validateField(field) : [];
    }

    /** Validates the field this rule is bound to, returning any resulting violations. */
    protected abstract validateField(field: FieldModel<TValueType>): Array<IRuleViolation>;
}
