import type { FieldModel, IOptionValue, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import type { IRuleContext } from "../rule-context";
import { Condition, ICondition } from "../condition";

/** Defines how a field's value is compared against a condition's expected value. */
export enum ComparisonOperator {
    equals = 0,
    notEquals = 1,
    isEmpty = 2,
    isNotEmpty = 3
}

/** Defines a condition that compares a field's value against an expected value. */
export interface IFieldValueCondition extends ICondition {
    /** The definition of the field this condition reads. */
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;
    /** The operator used to compare the field's value. */
    readonly operator: ComparisonOperator;
    /** The value the field's value is compared against, for the operators that take one. */
    readonly value?: TValueType;
}

/** Represents a condition that compares a field's value against an expected value. */
export class FieldValueCondition extends Condition implements IFieldValueCondition {
    readonly fieldDefinition: FieldDefinition<FieldModel<TValueType>>;
    readonly operator: ComparisonOperator;
    readonly value?: TValueType;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, operator: ComparisonOperator, value?: TValueType) {
        super(FieldValueCondition.name);

        this.fieldDefinition = fieldDefinition;
        this.operator = operator;
        this.value = value;
    }

    public isSatisfied(context: IRuleContext): boolean {
        const field = context.getField(this.fieldDefinition);
        if (!field) {
            return false;
        }

        switch (this.operator) {
            case ComparisonOperator.equals:
                return this.toComparable(field.getValue()) === this.toComparable(this.value);
            case ComparisonOperator.notEquals:
                return this.toComparable(field.getValue()) !== this.toComparable(this.value);
            case ComparisonOperator.isEmpty:
                return field.getIsEmpty();
            case ComparisonOperator.isNotEmpty:
                return !field.getIsEmpty();
            default:
                return false;
        }
    }

    /** Unwraps an option field's value/description pair to the underlying value that comparisons are made against. */
    private toComparable(value?: TValueType): TValueType | undefined {
        return this.isOptionValue(value) ? value.value : value;
    }

    private isOptionValue(value?: TValueType): value is IOptionValue {
        return typeof value === "object" && value !== null && !Array.isArray(value) && "value" in value;
    }
}
