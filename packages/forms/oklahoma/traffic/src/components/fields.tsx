import React from "react";
import {
    FieldModel,
    FControlBorderEdges,
    FInputType,
    IOptionValue,
    NumberFieldModel,
    OptionFieldModel,
    TValueType,
    FFieldControl,
    FFieldInput,
    FFieldSelect,
    FSelectFormat
} from "@forms/core";

/** The width of a Y/N box, sized for the single letter the form prints in it. */
const yesNoBoxWidth = 90;

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
    /** The input type; text by default, `date` for the form's date boxes. */
    readonly type?: FInputType;
    /** Exact width in pixels; the box fills the space it is given by default. */
    readonly width?: number;

    onChange: (value: string) => void;
}

/** One of the form's write-in boxes, labelled the way the form labels it. */
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

    onChange: (value: number) => void;
}

/** One of the form's numeric boxes. The input hands back a string, so the value is converted on the way out. */
export const NumberBox = ({ field, borderEdges, label, width, onChange }: INumberBoxProps): React.JSX.Element => (
    <FFieldControl width={width} label={label ?? field.label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldInput
            id={field.id}
            type="number"
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            value={field.getValue()}
            onChange={(value) => onChange(Number(value))}
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

/** One of the form's coded boxes, choosing from a registered value list. */
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

interface IYesNoBoxProps {
    /** The option field the box holds. */
    readonly field: OptionFieldModel;
    /** Loads the Y/N options; the service's `getYesNoOptions`, wrapped so the reference is stable. */
    readonly load: () => Promise<Array<IOptionValue>>;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** Exact width in pixels; wide enough for the letter the form prints by default. */
    readonly width?: number;

    onChange: (value: IOptionValue) => void;
}

/** One of the form's Y/N boxes. The box shows the letter the form prints, while the menu it opens spells out YES and NO. */
export const YesNoBox = ({ field, load, borderEdges, label, width = yesNoBoxWidth, onChange }: IYesNoBoxProps): React.JSX.Element => (
    <SelectBox
        field={field}
        load={load}
        borderEdges={borderEdges}
        format="valueOnly"
        label={label}
        width={width}
        onChange={onChange}
    />
);
