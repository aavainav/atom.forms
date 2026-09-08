import { FieldModel, IField } from "./field";

type StringValueType = string | string[];

/** Defines the model of a string field in a form. */
export interface IStringField extends IField {
    readonly value: StringValueType;
}

/** Represents a model for a string field in a form. */
export class StringFieldModel extends FieldModel<StringValueType> implements IStringField {
    public readonly value: StringValueType = "";

    public setDefaultValue(): this {
        return this.setValue("");
    }
}
