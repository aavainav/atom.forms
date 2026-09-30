import React from "react";

import FFieldControl, { FControlBorderEdges, FControlBorderVisibility } from "../field-control/field-control";
import FFieldSelect, { FSelectFormat } from "../field-select/field-select";
import { IOptionValue } from "../../models/field";
import { OptionFieldModel } from "../../models/option-field";
import { FPaddingSize, IFPadding } from "../../utils/spacing";

interface IFSelectFieldProps {
    /** The option field the box holds. */
    readonly field: OptionFieldModel;
    /** Loads the list's options. */
    readonly load: (parentValue?: string) => Promise<Array<IOptionValue>>;
    /** Whether the box's border is drawn at all; visible by default. */
    readonly border?: FControlBorderVisibility;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** Closes the box on top of whatever the field itself says, for a box another answer on the form has made moot. */
    readonly disabled?: boolean;
    /** How the chosen option is shown; its description by default. */
    readonly format?: FSelectFormat;
    /** Exact height in pixels. */
    readonly height?: number;
    /** The padding inside the select. A bare size applies to all four sides. */
    readonly inputPadding?: FPaddingSize | IFPadding;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** The value of the option this box's list hangs off, for a list with a parent -- reaches the loader as its argument. */
    readonly parentValue?: string;
    /** Text shown while nothing is chosen. */
    readonly placeholder?: string;
    /** Whether the list can be searched by typing; true by default. */
    readonly searchable?: boolean;
    /** Whether the placeholder still shows while the box is disabled. */
    readonly showPlaceholderWhenDisabled?: boolean;
    /** Whether the label is shown; true by default, false for a row inside a table that prints its column labels once, in a header row above it. */
    readonly showLabel?: boolean;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: IOptionValue) => void;
}

/** A coded box bound directly to a field model, choosing from a registered value list. */
export default function FSelectField({
    field,
    load,
    border,
    borderEdges,
    disabled,
    format = "descriptionOnly",
    height,
    inputPadding,
    label,
    parentValue,
    placeholder,
    searchable = true,
    showPlaceholderWhenDisabled,
    showLabel = true,
    width,
    onChange
}: IFSelectFieldProps): React.JSX.Element {
    return (
        <FFieldControl border={border} width={width} height={height} label={showLabel ? (label ?? field.label) : undefined} labelFor={field.id} borderEdges={borderEdges}>
            <FFieldSelect
                id={field.id}
                disabled={disabled || !field.getIsEnabled()}
                format={format}
                invalid={field.getHasError()}
                options={load}
                padding={inputPadding}
                parentValue={parentValue}
                placeholder={placeholder}
                searchable={searchable}
                showPlaceholderWhenDisabled={showPlaceholderWhenDisabled}
                value={field.getValue()}
                onChange={(value) => onChange(value as IOptionValue)}
            />
        </FFieldControl>
    );
}
