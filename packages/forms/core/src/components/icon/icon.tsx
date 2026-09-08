import * as React from "react";
import { buildClasses } from "../../utils/class-names";

export type FIconSize = "sm" | "md" | "lg";

interface IFIconProps {
    /** The icon to display. */
    readonly icon: string;
    /** Sets an optional size for the icon; default to 'sm'. */
    readonly size?: FIconSize;
}

/** An icon component */
export default function FIcon({ icon, size = "sm" }: IFIconProps): React.JSX.Element {
    return (
        <i
            className={
                buildClasses(
                    "bi",
                    `bi-${icon}`,
                    size === "sm" ? "fs-6" : "",
                    size === "md" ? "fs-4" : "",
                    size === "lg" ? "fs-2" : ""
                )
            }
        />
    );
}