import { FieldModel, IField } from "./field";

type NumberValueType = number | number[];

/** Defines the model of a number field in a form. */
export interface INumberField extends IField {
    readonly value: NumberValueType;
}

/** Represents a model for a number field in a form. */
export class NumberFieldModel extends FieldModel<NumberValueType> implements INumberField {
    public readonly value: NumberValueType = 0;

    /** A number field defaults to zero rather than to a blank value, so an unanswered field reads as zero. */
    public getIsEmpty(): boolean {
        return Array.isArray(this.value) ? this.value.length === 0 : !this.value;
    }

    public setDefaultValue(): this {
        return this.setValue(0);
    }
}
