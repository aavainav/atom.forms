import React from "react";

import FFieldCheckbox, { FCheckboxType } from "../field-checkbox/field-checkbox";
import { BooleanFieldModel } from "../../models/boolean-field";

interface IFCheckboxFieldProps {
    /** The boolean field the box holds. */
    readonly field: BooleanFieldModel;
    /** The label printed beside the box; the field's own label by default. */
    readonly label?: string;
    /** Whether the box is drawn as a checkbox or a radio button; a checkbox by default. */
    readonly type?: FCheckboxType;

    onChange: (checked: boolean) => void;
}

/** A tick box bound directly to a field model -- its label, enabled state, error state and value are all read straight off it. */
export default function FCheckboxField({ field, label, type, onChange }: IFCheckboxFieldProps): React.JSX.Element {
    return (
        <FFieldCheckbox
            id={field.id}
            label={label ?? field.label}
            checked={field.getValue() === true}
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            type={type}
            onChange={onChange}
        />
    );
}
