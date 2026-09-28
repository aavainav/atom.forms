import { FieldModel, IField } from "./field";

/** Defines the model of a hidden field in a form: a string value the model carries for its own bookkeeping, never rendered and never printed. */
export interface IHiddenField extends IField {
    readonly value: string;
}

/** Represents a model for a hidden field in a form. Behaves exactly like a string field; the distinct type is what marks a field as one no component should ever bind to. */
export class HiddenFieldModel extends FieldModel<string> implements IHiddenField {
    public readonly value: string = "";

    public setDefaultValue(): this {
        return this.setValue("");
    }
}
