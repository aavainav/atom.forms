import { FieldModel, IField } from "./field";

type BooleanValueType = boolean | boolean[];

/** Defines the model of a boolean field in a form. */
export interface IBooleanField extends IField {
    readonly value: BooleanValueType;
}

/** Represents a model for a boolean field in a form. */
export class BooleanFieldModel extends FieldModel<BooleanValueType> implements IBooleanField {
    public readonly value: BooleanValueType = false;

    public setDefaultValue(): this {
        return this.setValue(false);
    }
}
