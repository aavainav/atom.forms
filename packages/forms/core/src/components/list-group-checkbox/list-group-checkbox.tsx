import React from "react";
import FListGroupItem from "../list-group-item/list-group-item";
import FFieldCheckbox from "../field-checkbox/field-checkbox";

interface IFListGroupCheckboxProps {
    readonly id?: string;
    readonly checked?: boolean;
    readonly disabled?: boolean;
    readonly indeterminate?: boolean;
    readonly label?: string;

    onChange?: (checked: boolean) => void;
}

export default function FListGroupCheckbox({
    id,
    disabled = false,
    label,
    checked = false,
    indeterminate = false,
    children,
    onChange
}: React.PropsWithChildren<IFListGroupCheckboxProps>): React.JSX.Element {
    return (
        <FListGroupItem id={id} disabled={disabled} href="#" preventDefault onClick={() => onChange?.(!checked)}>
            {/* the box is disabled along with the row: the row's own click is what a click anywhere else on it
                goes through, but the input sits on top of it and would otherwise still toggle */}
            <FFieldCheckbox label={label} checked={checked} disabled={disabled} indeterminate={indeterminate} onChange={onChange}>
                {children}
            </FFieldCheckbox>
        </FListGroupItem>
    );
}
