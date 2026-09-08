import React, { useEffect, useRef } from "react";
import { buildClasses } from "../../utils/class-names";

export type FCheckboxLabelTextCase = "uppercase" | "capitalize" | "none";
export type FCheckboxType = "checkbox" | "radio";

interface IFFieldCheckboxProps {
    /** The `id` attribute applied to the input, and linked to the label via `htmlFor`. */
    readonly id?: string;
    /** Whether the input is checked. Default false. */
    readonly checked?: boolean;
    /** Disables the input, preventing it from being toggled. Default false. */
    readonly disabled?: boolean;
    /** Renders the input in the indeterminate visual state, independent of `checked`. Default false. */
    readonly indeterminate?: boolean;
    /** Whether the input is marked as invalid. */
    readonly invalid?: boolean;
    /** Text shown next to the input; ignored when `children` is given instead. */
    readonly label?: string;
    /** Text casing applied to the label. Default "uppercase". */
    readonly labelTextCase?: FCheckboxLabelTextCase;
    /** Renders the input as a toggle switch instead of a checkbox/radio. Default false. */
    readonly switch?: boolean;
    /** The `type` attribute applied to the input. Default "checkbox". */
    readonly type?: FCheckboxType;

    /** Called with the updated checked state whenever the user toggles the input. */
    onChange?: (checked: boolean) => void;
}

/** A checkbox, radio, or switch input with an optional label, bound directly to a field model's value via `checked`/`onChange`. */
export default function FFieldCheckbox({
    id,
    checked = false,
    disabled = false,
    indeterminate = false,
    invalid = false,
    label,
    labelTextCase = "uppercase",
    switch: isSwitch = false,
    type = "checkbox",
    children,
    onChange
}: React.PropsWithChildren<IFFieldCheckboxProps>): React.JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const labelContent = children ?? label ?? "";

    return (
        <div className={buildClasses("f-field-checkbox form-check", isSwitch ? "form-switch" : "", !labelContent ? "ps-0" : "")}>
            <input
                ref={inputRef}
                id={id}
                type={type}
                className={buildClasses(
                    "f-field-checkbox-input",
                    "form-check-input", 
                    "border-2",
                    invalid ? "is-invalid" : "",
                    "rounded-0", 
                    !labelContent ? "ms-0" : ""
                )}
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange?.(event.target.checked)}
            />
            {labelContent ? <label htmlFor={id} className={buildClasses("f-field-checkbox-label", "form-check-label", labelTextCase === "uppercase" ? "text-uppercase" : "")}>{labelContent}</label> : null}
        </div>
    );
}
