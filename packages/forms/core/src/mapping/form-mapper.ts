import { BooleanFieldModel } from "../models/boolean-field";
import { FieldModel, IOptionValue, TValueType } from "../models/field";
import { FieldDefinition } from "../models/field-definition";
import { FormModel } from "../models/form";
import { NumberFieldModel } from "../models/number-field";
import { OptionFieldModel } from "../models/option-field";
import { SectionModel } from "../models/section";
import { StringFieldModel } from "../models/string-field";

/** Maps a contract field's own value type to the one concrete `FieldModel` capable of holding it. */
export type FieldModelFor<T> =
    T extends IOptionValue ? OptionFieldModel :
    T extends boolean | boolean[] ? BooleanFieldModel :
    T extends number | number[] ? NumberFieldModel :
    T extends string | string[] ? StringFieldModel :
    never;

/** A form's data contract while it is being built up, before it is handed out as readonly. */
export type FormValues<TData> = { -readonly [TKey in keyof TData]: TData[TKey] };

/** Mirrors a data contract's shape, marking whichever of its fields -- at any depth -- should come back locked rather than editable. */
export type ReadOnlyFields<TData> = {
    readonly [TKey in keyof TData]?: TData[TKey] extends ReadonlyArray<infer TItem>
        ? ReadonlyArray<ReadOnlyFields<TItem>>
        : TData[TKey] extends object
            ? ReadOnlyFields<TData[TKey]>
            : boolean;
};

/** The data a mapper populates a form from, and which of its own fields, if any, should come back locked rather than editable. */
export interface IPopulateData<TData extends object> {
    /** The record, in the shape the target form's own contract publishes. */
    readonly data: TData;
    /** Which of `data`'s own fields come back locked rather than editable. */
    readonly readOnlyFields?: ReadOnlyFields<TData>;
}

/** Translates between a form and the data contract it publishes. */
export interface IFormMapper<TForm extends FormModel<any>, TData extends object> {
    /** Returns the form's current values as its data contract, emitting every field the form owns. */
    extract(form: TForm): TData;
    /**
     * Returns a new form with the given data applied; fields the data does not mention keep the values they hold.
     *
     * A form whose pages repeat has to create a page per record the data carries, and creating a page means
     * awaiting its `initialize`, so a mapper may answer with a promise. A mapper over a form of fixed pages has
     * nothing to await and returns the form directly.
     *
     * `readOnlyFields`, when given, marks which of the data's own fields should come back disabled rather than
     * editable -- for a host stamping a default value it considers a settled fact rather than an editable
     * suggestion. A field the mapper hasn't wired up for locking (see `FormMapper.write`) stays editable
     * regardless of being marked here.
     */
    populate(form: TForm, input: IPopulateData<TData>): TForm | Promise<TForm>;
}

/**
 * Represents an abstract base class for a form's data mapper.
 *
 * A mapper is hand-written per form: every field it carries is listed by name, in a method per section, so a
 * field added to the form and forgotten here shows up as a gap a reader can see. What the base contributes is
 * the pair of field-level primitives every mapper needs and the shape of the two directions.
 */
export abstract class FormMapper<TForm extends FormModel<any>, TData extends object> implements IFormMapper<TForm, TData> {
    abstract extract(form: TForm): TData;
    abstract populate(form: TForm, input: IPopulateData<TData>): TForm | Promise<TForm>;

    /**
     * Assigns the field's current value to the given key, whether or not the field has been answered, so every
     * field the mapper names comes back with a real entry rather than a gap a reader has to account for separately.
     *
     * `field` must be the one concrete `FieldModel` shaped for `key`'s own value type -- a `string` key refuses a
     * `BooleanFieldModel` at compile time, which is what catches a field wired to the wrong key.
     *
     * The target is any object rather than the mapper's own contract, so a contract that nests a record per
     * repeated page can be filled through the same primitive as the flat part of it is.
     */
    protected read<TTarget extends object, TKey extends keyof TTarget>(
        data: FormValues<TTarget>,
        key: TKey,
        field: FieldModelFor<NonNullable<TTarget[TKey]>>
    ): void {
        data[key] = <TTarget[TKey]>(field.getValue());
    }

    /**
     * Returns a new section with the field set from `data[key]`, or the section unchanged when that value is
     * undefined, so a key the data does not mention leaves the field holding whatever it already had.
     *
     * This mirrors `read`: the target comes first and the key is named once, with the value derived rather than
     * passed alongside it. Because the key is always in hand, every field written through here is lockable - when
     * `readOnlyFields` marks the key the field also comes back disabled, for a host stamping a default value it
     * considers settled rather than editable. A section method that threads `readOnlyFields` gets that for every
     * field it writes; one that doesn't simply never locks.
     *
     * The source is any object rather than the mapper's own contract, for the same reason `read`'s target is: a
     * contract that nests a record per repeated page is written through the same primitive.
     *
     * `definition` must be a `FieldDefinition` of the one concrete `FieldModel` shaped for `key`'s own value type,
     * the same guard `read` applies in the other direction.
     */
    protected write<TSection extends SectionModel, TSource extends object, TKey extends keyof TSource>(
        section: TSection,
        definition: FieldDefinition<FieldModelFor<NonNullable<TSource[TKey]>>>,
        data: TSource,
        key: TKey,
        readOnlyFields?: ReadOnlyFields<TSource>
    ): TSection {
        const value = <TValueType | undefined>data[key];

        if (value === undefined) {
            return section;
        }

        let field = section.get<FieldModel<TValueType>>(definition).setValue(value);
        if (readOnlyFields?.[key]) {
            field = field.setIsEnabled(false);
        }

        return section.set(definition, field);
    }
}
