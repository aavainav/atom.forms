import React from "react";
import { buildClasses } from "../../utils/class-names";

// TODO: Bootstrap only has 'sm' size for now. Create other sizes or look into how to set custom sizes.
export type FSpinnerSize = "sm";
export type FSpinnerVariant =
    "primary" | 
    "secondary" | 
    "success" | 
    "info" | 
    "warning" | 
    "danger" | 
    "light" | 
    "dark" | 
    "link" |
    "none";

interface IFSpinnerProps {
    readonly size?: FSpinnerSize;
    /** The variant of the spinner; default to primary. */
    readonly variant?: FSpinnerVariant | string;
}

/** Defines the spinner component. */
export default function FSpinner({ size, variant = "primary" }: IFSpinnerProps): React.JSX.Element {
    return (
        <div className={
            buildClasses(
                "spinner-border",
                size && size === "sm" ? "spinner-border-sm" : "",
                `text-${variant}`
            )} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    );
}