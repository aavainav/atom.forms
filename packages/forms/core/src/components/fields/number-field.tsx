import React from "react";

import FFieldControl, { FControlBorderEdges } from "../field-control/field-control";
import FFieldInput from "../field-input/field-input";
import { NumberFieldModel } from "../../models/number-field";

interface IFNumberFieldProps {
    /** The number field the box holds; its value is written back as a number. */
    readonly field: NumberFieldModel;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** Whether the label is shown; true by default, false for a row inside a table that prints its column labels once, in a header row above it. */
    readonly showLabel?: boolean;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: number) => void;
}

/** A numeric write-in box bound directly to a field model. The input hands back a string, so the value is converted on the way out. */
export default function FNumberField({ field, borderEdges, label, showLabel = true, width, onChange }: IFNumberFieldProps): React.JSX.Element {
    return (
        <FFieldControl width={width} label={showLabel ? (label ?? field.label) : undefined} labelFor={field.id} borderEdges={borderEdges}>
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
}
