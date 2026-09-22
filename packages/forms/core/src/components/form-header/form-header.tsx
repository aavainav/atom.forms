import React from "react";
import { buildClasses } from "../../utils/class-names";

/** Whether the border below the header is drawn. */
export type FFormHeaderBorderVisibility = "hidden" | "visible";

interface IFFormHeaderProps {
    /** Whether the border below the header is drawn. Hidden by default. */
    readonly borderVisibility?: FFormHeaderBorderVisibility;
    /** Text shown in italics below the title. */
    readonly subtitle?: string;
    /** The heading text. */
    readonly title: string;
}

/** A form's title, an optional subtitle beneath it, and actions -- such as workflow buttons -- rendered to its right. */
export default function FFormHeader({ title, subtitle, borderVisibility = "hidden", children }: React.PropsWithChildren<IFFormHeaderProps>): React.JSX.Element {
    return (
        <div className={buildClasses(
            "f-form-header",
            "d-flex",
            "align-items-center",
            "justify-content-between",
            "mb-4",
            borderVisibility === "visible" ? "border-bottom" : ""
        )}>
            <div>
                <h2 className="f-form-header__title fw-bold text-secondary">{title}</h2>
                {subtitle && <small className="f-form-header__subtitle d-block fst-italic">{subtitle}</small>}
            </div>
            <div className="f-form-header__actions d-flex">
                {children}
            </div>
        </div>
    );
}
