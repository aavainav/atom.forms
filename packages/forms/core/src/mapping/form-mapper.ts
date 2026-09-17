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
     * Returns a new form with the given data applied; a key the data omits leaves that field as it was.
     *
     * A form whose pages repeat creates a page per record, which needs awaiting `initialize` -- hence the promise;
     * a form of fixed pages has nothing to await and returns directly.
     *
     * `readOnlyFields` marks which fields come back disabled rather than editable, for a host-stamped default it
     * considers settled. Only fields the mapper wires through `write` (see below) can actually lock.
     */
    populate(form: TForm, input: IPopulateData<TData>): TForm | Promise<TForm>;
}

/**
 * Abstract base for a form's data mapper. A mapper is hand-written per form -- every field listed by name, in a
 * method per section -- so a forgotten field shows up as a visible gap. This base supplies the two field-level
 * primitives (`read`/`write`) every mapper needs.
 */
export abstract class FormMapper<TForm extends FormModel<any>, TData extends object> implements IFormMapper<TForm, TData> {
    abstract extract(form: TForm): TData;
    abstract populate(form: TForm, input: IPopulateData<TData>): TForm | Promise<TForm>;

    /**
     * Assigns the field's value to `key`, answered or not, so every named field comes back as a real entry.
     *
     * `field` must be the concrete `FieldModel` matching `key`'s value type -- a `string` key refuses a
     * `BooleanFieldModel` at compile time, catching a field wired to the wrong key.
     *
     * The target is any object, not the mapper's own contract, so a nested per-page record fills through the same
     * primitive as the flat part does.
     */
    protected read<TTarget extends object, TKey extends keyof TTarget>(
        data: FormValues<TTarget>,
        key: TKey,
        field: FieldModelFor<NonNullable<TTarget[TKey]>>
    ): void {
        data[key] = <TTarget[TKey]>(field.getValue());
    }

    /**
     * Returns a new section with the field set from `data[key]`, unchanged if that value is undefined -- a key the
     * data omits leaves the field as it was. Mirrors `read`: the target comes first, the key named once.
     *
     * Every field written here is lockable: when `readOnlyFields` marks the key, the field also comes back
     * disabled, for a host-stamped default it considers settled. A section method that threads `readOnlyFields`
     * gets that for every field it writes; one that doesn't simply never locks.
     *
     * The source is any object, not the mapper's own contract, for the same nesting reason as `read`. `definition`
     * must be a `FieldDefinition` of the concrete `FieldModel` matching `key`'s value type -- the same guard `read`
     * applies in reverse.
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
