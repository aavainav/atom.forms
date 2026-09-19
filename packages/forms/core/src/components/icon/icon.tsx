import * as React from "react";
import { buildClasses } from "../../utils/class-names";

export type FIconSize = "sm" | "md" | "lg";
export type FIconVariant =
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

interface IFIconProps {
    /** The icon to display. */
    readonly icon: string;
    /** Sets an optional size for the icon; default to 'sm'. */
    readonly size?: FIconSize;
    /** Sets an optional font variant for the icon; default to 'secondary'. */
    readonly variant?: FIconVariant;
}

/** An icon component */
export default function FIcon({ icon, size = "sm", variant = "secondary" }: IFIconProps): React.JSX.Element {
    return (
        <i
            className={
                buildClasses(
                    "bi",
                    `bi-${icon}`,
                    size === "sm" ? "fs-6" : "",
                    size === "md" ? "fs-4" : "",
                    size === "lg" ? "fs-2" : "",
                    `text-${variant}`
                )
            }
        />
    );
}