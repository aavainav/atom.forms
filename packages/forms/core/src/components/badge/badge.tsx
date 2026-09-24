import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FBadgeVariant = "primary" | "secondary" | "success" | "info" | "warning" | "danger" | "light" | "dark";

interface IFBadgeProps {
    /** Text for assistive technology, read after the badge's own text, such as "open". */
    readonly label?: string;
    /** Whether the badge sits on the top end corner of the button it is in. */
    readonly overlay?: boolean;
    /** Whether the badge has fully rounded ends, as a count does; defaults to false. */
    readonly pill?: boolean;
    /** The colour of the badge; defaults to secondary. */
    readonly variant?: FBadgeVariant;
}

/** A small badge of text, such as a count, on or beside a control. */
export default function FBadge({ label, overlay = false, pill = false, variant = "secondary", children }: React.PropsWithChildren<IFBadgeProps>): React.JSX.Element {
    return (
        <span className={buildClasses("badge", `text-bg-${variant}`, pill && "rounded-pill", overlay && "f-badge--overlay")}>
            {children}
            {label && <span className="visually-hidden"> {label}</span>}
        </span>
    );
}
