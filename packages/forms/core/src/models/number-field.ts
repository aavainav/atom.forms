import { FieldModel, IField } from "./field";

type NumberValueType = number | number[] | null;

/** Defines the model of a number field in a form. */
export interface INumberField extends IField {
    readonly value: NumberValueType;
}

/** Represents a model for a number field in a form. */
export class NumberFieldModel extends FieldModel<NumberValueType> implements INumberField {
    public readonly value: NumberValueType = null;

    /** An unanswered number field holds null, so a real zero is an answer rather than a blank. */
    public getIsEmpty(): boolean {
        return this.value === null || this.value === undefined || (Array.isArray(this.value) && this.value.length === 0);
    }

    public setDefaultValue(): this {
        return this.setValue(null);
    }
}
