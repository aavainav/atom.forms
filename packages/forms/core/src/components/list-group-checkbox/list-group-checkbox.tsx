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
            <FFieldCheckbox label={label} checked={checked} indeterminate={indeterminate} onChange={onChange}>
                {children}
            </FFieldCheckbox>
        </FListGroupItem>
    );
}
