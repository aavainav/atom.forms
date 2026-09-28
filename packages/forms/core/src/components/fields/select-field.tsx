import React from "react";

import FFieldControl, { FControlBorderEdges } from "../field-control/field-control";
import FFieldSelect, { FSelectFormat } from "../field-select/field-select";
import { IOptionValue } from "../../models/field";
import { OptionFieldModel } from "../../models/option-field";

interface IFSelectFieldProps {
    /** The option field the box holds. */
    readonly field: OptionFieldModel;
    /** Loads the list's options. */
    readonly load: (parentValue?: string) => Promise<Array<IOptionValue>>;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** Closes the box on top of whatever the field itself says, for a box another answer on the form has made moot. */
    readonly disabled?: boolean;
    /** How the chosen option is shown; its description by default. */
    readonly format?: FSelectFormat;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** The value of the option this box's list hangs off, for a list with a parent -- reaches the loader as its argument. */
    readonly parentValue?: string;
    /** Whether the label is shown; true by default, false for a row inside a table that prints its column labels once, in a header row above it. */
    readonly showLabel?: boolean;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: IOptionValue) => void;
}

/** A coded box bound directly to a field model, choosing from a registered value list. */
export default function FSelectField({ field, load, borderEdges, disabled, format = "descriptionOnly", label, parentValue, showLabel = true, width, onChange }: IFSelectFieldProps): React.JSX.Element {
    return (
        <FFieldControl width={width} label={showLabel ? (label ?? field.label) : undefined} labelFor={field.id} borderEdges={borderEdges}>
            <FFieldSelect
                id={field.id}
                disabled={disabled || !field.getIsEnabled()}
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
}
