import { FieldModel, IField, IOptionValue } from "./field";

const defaultValue: IOptionValue = { value: "", description: "" };

/** Defines the model of a code/description option field in a form. */
export interface IOptionField extends IField {
    /** The value of an option field, which is a value/description pair. */
    readonly value: IOptionValue;
}

/** Represents a model for a code/description option field in a form. */
export class OptionFieldModel extends FieldModel<IOptionValue> implements IOptionField {
    public readonly value: IOptionValue = defaultValue;

    /** An option field always holds a value/description pair, so emptiness is decided when both value and description are empty. */
    public getIsEmpty(): boolean {
        return !this.value?.value && !this.value?.description;
    }

    public setDefaultValue(): this {
        return this.setValue(defaultValue);
    }
}
