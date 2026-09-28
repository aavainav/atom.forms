import React from "react";

import FFieldControl, { FControlBorderEdges } from "../field-control/field-control";
import FFieldInput, { FInputType } from "../field-input/field-input";
import { FieldModel, TValueType } from "../../models/field";

interface IFTextFieldProps {
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
    /** Whether the label is shown; true by default, false for a row inside a table that prints its column labels once, in a header row above it. */
    readonly showLabel?: boolean;
    /** The input type; text by default. */
    readonly type?: FInputType;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: TValueType) => void;
}

/** A write-in text box bound directly to a field model -- its label, enabled state, error state and value are all read straight off it. */
export default function FTextField({ field, borderEdges, height, label, maxlength, showLabel = true, type, width, onChange }: IFTextFieldProps): React.JSX.Element {
    return (
        <FFieldControl width={width} height={height} label={showLabel ? (label ?? field.label) : undefined} labelFor={field.id} borderEdges={borderEdges}>
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
}
