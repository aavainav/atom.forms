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
     *
     * `readOnlyFields`, when given, names which of the data's own fields should come back disabled rather than
     * editable -- for a host stamping a default value it considers a settled fact rather than an editable
     * suggestion. A field the mapper hasn't wired up for locking (see `FormMapper.write`) stays editable
     * regardless of being named here.
     */
    populate(form: TForm, data: TData, readOnlyFields?: ReadonlySet<keyof TData>): TForm | Promise<TForm>;
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
    abstract populate(form: TForm, data: TData, readOnlyFields?: ReadonlySet<keyof TData>): TForm | Promise<TForm>;

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

    /**
     * Returns a new section with the field set from `data[key]`, or the section unchanged when that value is
     * undefined, so a key the data does not mention leaves the field holding whatever it already had.
     *
     * This mirrors `read`: the target comes first and the key is named once, with the value derived rather than
     * passed alongside it. Because the key is always in hand, every field written through here is lockable - when
     * `readOnlyFields` contains the key the field also comes back disabled, for a host stamping a default value it
     * considers settled rather than editable. A section method that threads `readOnlyFields` gets that for every
     * field it writes; one that doesn't simply never locks.
     *
     * The source is any object rather than the mapper's own contract, for the same reason `read`'s target is: a
     * contract that nests a record per repeated page is written through the same primitive. Such a sub-record has
     * no locking of its own, since `populate` only ever names top-level keys.
     */
    protected write<TSection extends SectionModel, TSource extends object, TKey extends keyof TSource>(
        section: TSection,
        definition: FieldDefinition<FieldModel<TValueType>>,
        data: TSource,
        key: TKey,
        readOnlyFields?: ReadonlySet<keyof TSource>
    ): TSection {
        const value = <TValueType | undefined><unknown>data[key];

        if (value === undefined) {
            return section;
        }

        let field = section.get<FieldModel<TValueType>>(definition).setValue(value);
        if (readOnlyFields?.has(key)) {
            field = field.setIsEnabled(false);
        }

        return section.set(definition, field);
    }
}
