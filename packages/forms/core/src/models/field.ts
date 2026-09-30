import { withChanges } from "../utils/clone";

export type FieldModelConstructor<T> = new (field: IField) => T;

/** Represents a value/description pair */
export interface IOptionValue {
    readonly value: string;
    readonly description: string;
}

export type TValueType = string | number | boolean | string[] | number[] | boolean[] | IOptionValue | null;

/** Describes the raw shape of a field, as provided to a `FieldModel` constructor. */
export interface IField {
    /** The unique identifier of the field. */
    readonly id?: string;
    /** The display label for the field. */
    readonly label: string;
    /** The name of the field. */
    readonly name: string;
    /** The current value of the field. */
    readonly value: TValueType;

    /** Whether the field has a validation error or not. */
    readonly hasError?: boolean;
    /** Whether the field is enabled for editing. */
    readonly isEnabled?: boolean;
}

/** Defines the model of a form field. */
export interface IFieldModel<TValue extends TValueType> extends IField {
    readonly id?: string;
    readonly label: string;
    readonly name: string;
    readonly value: TValueType;

    readonly hasError?: boolean;
    readonly isEnabled?: boolean;

    /** Returns whether the field has a validation error or not. */
    getHasError(): boolean;
    /** Returns whether the field's value is empty. */
    getIsEmpty(): boolean;
    /** Returns whether the field is enabled for editing. */
    getIsEnabled(): boolean;
    /** Returns the field's current value. */
    getValue(): TValue;
    /** Returns a new field with its value reset to the type's default. */
    setDefaultValue(): this;
    /** Returns a new field with the given has error state. */
    setHasError(hasError: boolean): this;
    /** Returns a new field with the given enabled state. */
    setIsEnabled(isEnabled: boolean): this;
    /** Returns a new field with the given value. */
    setValue(value: TValue): this;
}

/** Represents an abstract model for a form field. */
export abstract class FieldModel<TValue extends TValueType> implements IFieldModel<TValue> {
    public readonly id?: string = crypto.randomUUID();
    public readonly name: string;
    public readonly label: string;

    public readonly value: TValue;

    public readonly hasError?: boolean = false;
    public readonly isEnabled?: boolean = true;

    constructor(field: IField) {
        this.name = field.name;
        this.label = field.label;

        this.value = <TValue>field.value;
    }

    public getHasError(): boolean {
        return this.hasError!;
    }

    public getIsEmpty(): boolean {
        return this.value === null || this.value === undefined || this.value === "" || this.value === false;
    }

    public getIsEnabled(): boolean {
        return this.isEnabled!;
    }

    public getValue(): TValue {
        return <TValue>this.value;
    }

    abstract setDefaultValue(): this;

    public setHasError(hasError: boolean): this {
        return withChanges(this, { hasError });
    }

    public setIsEnabled(isEnabled: boolean): this {
        return withChanges(this, { isEnabled });
    }

    public setValue(value: TValue): this {
        return withChanges(this, { value });
    }
}
