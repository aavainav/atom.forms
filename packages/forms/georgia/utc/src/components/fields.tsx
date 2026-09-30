import React from "react";
import {
    BooleanFieldModel,
    FieldModel,
    FControlBorderEdges,
    FInputType,
    IOptionValue,
    NumberFieldModel,
    OptionFieldModel,
    TValueType,
    FFieldCheckbox,
    FFieldControl,
    FFieldInput,
    FFieldSelect,
    FSelectFormat
} from "@forms/core";

/** The width of a box holding a day, hour, minute or two digit year. */
export const twoDigitBoxWidth = 90;

interface ITextBoxProps {
    /** The field the box holds. */
    readonly field: FieldModel<TValueType>;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** Exact height in pixels. */
    readonly height?: number;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** The maximum number of characters the box accepts. */
    readonly maxlength?: number;
    /** The input type; text by default, `date` for the citation's two full date boxes. */
    readonly type?: FInputType;
    /** Exact width in pixels; the box fills the space it is given by default. */
    readonly width?: number;

    onChange: (value: TValueType) => void;
}

/** One of the citation's write-in boxes, labelled the way the citation labels it. */
export const TextBox = ({ field, borderEdges, height, label, maxlength, type, width, onChange }: ITextBoxProps): React.JSX.Element => (
    <FFieldControl width={width} height={height} label={label ?? field.label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldInput
            id={field.id}
            type={type}
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            maxlength={maxlength}
            value={field.getValue()}
            onChange={onChange}
        />
    </FFieldControl>
);

interface INumberBoxProps {
    /** The number field the box holds; its value is written back as a number. */
    readonly field: NumberFieldModel;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: number | null) => void;
}

/** One of the citation's numeric boxes. The input hands back a string, so the value is converted on the way out -- a cleared box to null. */
export const NumberBox = ({ field, borderEdges, label, width, onChange }: INumberBoxProps): React.JSX.Element => (
    <FFieldControl width={width} label={label ?? field.label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldInput
            id={field.id}
            type="number"
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            value={field.getValue()}
            onChange={(value) => onChange(value === "" ? null : Number(value))}
        />
    </FFieldControl>
);

interface ISelectBoxProps {
    /** The option field the box holds. */
    readonly field: OptionFieldModel;
    /** Loads the list's options. */
    readonly load: (parentValue?: string) => Promise<Array<IOptionValue>>;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** How the chosen option is shown; its description by default. */
    readonly format?: FSelectFormat;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** The value of the option this box's list hangs off, for a list with a parent -- reaches the loader as its argument, the whole of the dependency between two boxes. */
    readonly parentValue?: string;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: IOptionValue) => void;
}

/** One of the citation's coded boxes, choosing from a registered value list. */
export const SelectBox = ({ field, load, borderEdges, format = "descriptionOnly", label, parentValue, width, onChange }: ISelectBoxProps): React.JSX.Element => (
    <FFieldControl width={width} label={label ?? field.label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldSelect
            id={field.id}
            disabled={!field.getIsEnabled()}
            format={format}
            invalid={field.getHasError()}
            options={load}
            parentValue={parentValue}
            searchable
            value={field.getValue()}
            onChange={(value) => onChange(value as IOptionValue)}
        />
    </FFieldControl>
);

interface ICheckBoxProps {
    /** The boolean field the box holds. */
    readonly field: BooleanFieldModel;
    /** The label printed beside the box; the field's own label by default. */
    readonly label?: string;

    onChange: (checked: boolean) => void;
}

/**
 * One of the citation's independent checkboxes - a box that answers its own question and can be ticked or cleared
 * without touching any other. Use `OptionBox` for a box that belongs to a group answering one question.
 */
export const CheckBox = ({ field, label, onChange }: ICheckBoxProps): React.JSX.Element => (
    <FFieldCheckbox
        id={field.id}
        label={label ?? field.label}
        checked={field.getValue() as boolean}
        disabled={!field.getIsEnabled()}
        invalid={field.getHasError()}
        onChange={onChange}
    />
);

interface IOptionBoxProps {
    /** The boolean field the box holds. */
    readonly field: BooleanFieldModel;
    /** The label printed beside the box; the field's own label by default. */
    readonly label?: string;

    /** Selects this box, which must clear the rest of its group - call the section's matching `select*` method. */
    onSelect: () => void;
}

/**
 * One box of a group answering a single question -- a YES/NO pair, the weather column, the plea options. Renders
 * as a radio so the group reads on screen as the printed row reads on paper; `onSelect` must go through the
 * section's `select*` method, which clears the rest of the group in the same update. Being a radio, it can't be
 * cleared by clicking again -- a group is left unanswered by never ticking it.
 */
export const OptionBox = ({ field, label, onSelect }: IOptionBoxProps): React.JSX.Element => (
    <FFieldCheckbox
        id={field.id}
        label={label ?? field.label}
        type="radio"
        checked={field.getValue() as boolean}
        disabled={!field.getIsEnabled()}
        invalid={field.getHasError()}
        onChange={onSelect}
    />
);
