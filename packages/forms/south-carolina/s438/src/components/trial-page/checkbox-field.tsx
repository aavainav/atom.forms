import React from "react";
import { BooleanFieldModel, FFieldCheckbox } from "@forms/core";

interface ICheckboxFieldProps {
    /** The field the box holds. */
    readonly field: BooleanFieldModel;

    onChange: (checked: boolean) => void;
}

/** One of the trial copy's tick boxes, bound directly to a field model -- its label, enabled state and value are all read straight off it. */
export default function CheckboxField({ field, onChange }: ICheckboxFieldProps): React.JSX.Element {
    return (
        <FFieldCheckbox
            id={field.id}
            label={field.label}
            checked={field.getValue() as boolean}
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            onChange={onChange}
        />
    );
}
