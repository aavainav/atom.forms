import React from "react";

import { buildClasses } from "../../utils/class-names";
import { getMarginStyle, FMarginSize, IFMargin } from "../../utils/spacing";

interface IFFieldTextAreaProps {
    /** Whether the text area is disabled. */
    readonly disabled?: boolean;
    /** The id attribute applied to the text area. */
    readonly id?: string;
    /** Whether the text area is marked as invalid. */
    readonly invalid?: boolean;
    /** Names the text area for assistive technology, since it is drawn without a visible label. */
    readonly label?: string;
    /** Sets the margin of the text area. A bare size applies to all four sides. */
    readonly margin?: FMarginSize | IFMargin;
    /** The maximum number of characters accepted. */
    readonly maxlength?: number;
    /** Placeholder text displayed when the text area is empty; hidden while it is disabled, as a locked field's is. */
    readonly placeholder?: string;
    /** How many lines tall the text area is. Defaults to 3. */
    readonly rows?: number;
    /** The text it holds. */
    readonly value?: string;

    /** Invoked with the text whenever it changes. */
    onChange?: (value: string) => void;
}

/** A multi-line text input. */
export default function FFieldTextArea({ disabled = false, id, invalid = false, label, margin, maxlength, placeholder, rows = 3, value, onChange }: IFFieldTextAreaProps): React.JSX.Element {
    return (
        <textarea
            id={id}
            aria-label={label}
            style={getMarginStyle(undefined, margin)}
            className={buildClasses("f-field-textarea", "form-control", invalid ? "is-invalid" : "")}
            disabled={disabled}
            maxLength={maxlength}
            placeholder={disabled ? undefined : placeholder}
            rows={rows}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
        />
    );
}
