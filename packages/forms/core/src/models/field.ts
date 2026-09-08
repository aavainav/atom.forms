import { withChanges } from "../utils/clone";

export type FieldModelConstructor<T> = new (field: IField) => T;

/** Represents a value/description pair */
export interface IOptionValue {
    readonly value: string;
    readonly description: string;
}

export type TValueType = string | number | boolean | string[] | number[] | boolean[] | IOptionValue;

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
    /** Whether the field's value has been changed from its default. */
    readonly isDirty?: boolean;
}

/** Defines the model of a form field. */
export interface IFieldModel<T extends TValueType> extends IField {
    readonly id?: string;
    readonly label: string;
    readonly name: string;
    readonly value: TValueType;

    readonly hasError?: boolean;
    readonly isEnabled?: boolean;
    readonly isDirty?: boolean;

    /** Returns whether the field has a validation error or not. */
    getHasError(): boolean;
    /** Returns whether the field's value has been changed from its default. */
    getIsDirty(): boolean;
    /** Returns whether the field's value is empty. */
    getIsEmpty(): boolean;
    /** Returns whether the field is enabled for editing. */
    getIsEnabled(): boolean;
    /** Returns the field's current value. */
    getValue(): T;
    /** Returns a new field with its value reset to the type's default. */
    setDefaultValue(): this;
    /** Returns a new field with the given has error state. */
    setHasError(hasError: boolean): this;
    /** Returns a new field with the given dirty state. */
    setIsDirty(isDirty: boolean): this;
    /** Returns a new field with the given enabled state. */
    setIsEnabled(isEnabled: boolean): this;
    /** Returns a new field with the given value. */
    setValue(value: T): this;
}

/** Represents an abstract model for a form field. */
export abstract class FieldModel<T extends TValueType> implements IFieldModel<T> {
    public readonly id?: string = crypto.randomUUID();
    public readonly name: string;
    public readonly label: string;

    public readonly value: T;

    public readonly hasError?: boolean = false;
    public readonly isEnabled?: boolean = true;
    public readonly isDirty?: boolean = false;

    constructor(field: IField) {
        this.name = field.name;
        this.label = field.label;

        this.value = <T>field.value;
    }

    public getHasError(): boolean {
        return this.hasError!;
    }

    public getIsDirty(): boolean {
        return this.isDirty!;
    }

    public getIsEmpty(): boolean {
        return this.value === null || this.value === undefined || this.value === "" || this.value === false;
    }

    public getIsEnabled(): boolean {
        return this.isEnabled!;
    }

    public getValue(): T {
        return <T>this.value;
    }

    abstract setDefaultValue(): this;

    public setHasError(hasError: boolean): this {
        return withChanges(this, { hasError });
    }

    public setIsDirty(isDirty: boolean): this {
        return withChanges(this, { isDirty });
    }

    public setIsEnabled(isEnabled: boolean): this {
        return withChanges(this, { isEnabled });
    }

    public setValue(value: T): this {
        return withChanges(this, { value });
    }
}
