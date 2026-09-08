import { FieldModel, TValueType } from "../models/field";
import { FieldDefinition } from "../models/field-definition";
import { FormModel } from "../models/form";
import { SectionModel } from "../models/section";

/** A form's data contract while it is being built up, before it is handed out as readonly. */
export type FormValues<TData> = { -readonly [TKey in keyof TData]: TData[TKey] };

/** Translates between a form and the data contract it publishes. */
export interface IFormMapper<TForm extends FormModel, TData extends object> {
    /** Returns the form's current values as its data contract, emitting only the fields the form owns. */
    extract(form: TForm): TData;
    /**
     * Returns a new form with the given data applied; fields the data does not mention keep the values they hold.
     *
     * A form whose pages repeat has to create a page per record the data carries, and creating a page means
     * awaiting its `initialize`, so a mapper may answer with a promise. A mapper over a form of fixed pages has
     * nothing to await and returns the form directly.
     */
    populate(form: TForm, data: TData): TForm | Promise<TForm>;
}

/**
 * Represents an abstract base class for a form's data mapper.
 *
 * A mapper is hand-written per form: every field it carries is listed by name, in a method per section, so a
 * field added to the form and forgotten here shows up as a gap a reader can see. What the base contributes is
 * the pair of field-level primitives every mapper needs and the shape of the two directions.
 */
export abstract class FormMapper<TForm extends FormModel, TData extends object> implements IFormMapper<TForm, TData> {
    abstract extract(form: TForm): TData;
    abstract populate(form: TForm, data: TData): TForm | Promise<TForm>;

    /**
     * Assigns the field's value to the given key, leaving the key absent when the field is empty so that an
     * unanswered field reads as missing rather than as its type's default - an untouched number field holds 0,
     * which would otherwise be reported as a vehicle year of 0. A boolean field is never empty, so every checkbox
     * reports its true/false state.
     *
     * The target is any object rather than the mapper's own contract, so a contract that nests a record per
     * repeated page can be filled through the same rule about empty fields as the flat part of it is.
     */
    protected read<TTarget extends object, TKey extends keyof TTarget>(data: FormValues<TTarget>, key: TKey, field: FieldModel<TValueType>): void {
        if (!field.getIsEmpty()) {
            data[key] = <TTarget[TKey]>(<unknown>field.getValue());
        }
    }

    /** Returns a new section with the field set from the given value, or the section unchanged when the value is undefined. */
    protected write<TSection extends SectionModel>(section: TSection, definition: FieldDefinition<FieldModel<TValueType>>, value: TValueType | undefined): TSection {
        return value === undefined
            ? section
            : section.set(definition, section.get<FieldModel<TValueType>>(definition).setValue(value));
    }
}
