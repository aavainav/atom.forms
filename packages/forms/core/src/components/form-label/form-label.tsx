import React from "react";

export type FLabelSize = "1" | "2" | "3" | "4" | "5" | "6";
export type FLabelTextAlignment = "start" | "center" | "end";
export type FLabelVariant =
    "primary" |
    "secondary" |
    "success" |
    "info" |
    "warning" |
    "danger" |
    "light" |
    "dark" |
    "link" |
    "none" |
    "outline-primary" |
    "outline-secondary" |
    "outline-success" |
    "outline-info" |
    "outline-warning" |
    "outline-danger" |
    "outline-light" |
    "outline-dark";

interface IFLabelProps {
    /** Sets the size of the label font; default to `6`. Label sizes go in asc order from largest `(1)` to smallest `(6)`. */
    readonly fontSize?: FLabelSize;
    /** Sets the alignment of the text; default to start. */
    readonly textAlignment?: FLabelTextAlignment;
    /** Sets the color variant of the text; default to secondary. */
    readonly variant?: FLabelVariant;
}

/** Defines a form label, which is a stand alone label. */
export default function FLabel({ fontSize = "6", textAlignment = "start", variant = "secondary", children }: React.PropsWithChildren<IFLabelProps>): React.JSX.Element {
    return (
        <span className={`f-label d-block fs-${fontSize} text-${textAlignment} text-${variant}`}>{children}</span>
    );
}