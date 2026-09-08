import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FControlBorderEdge = "all" | "top" | "right" | "bottom" | "left";
export type FControlBorderEdges = FControlBorderEdge | FControlBorderEdge[];
export type FControlBorderStyle = "form" | "wizard";
export type FControlBorderVisibility = "visible" | "hidden";
export type FControlLabelFontWeight = "normal" | "bold";
export type FControlLabelTextCase = "uppercase" | "capitalize" | "none";

interface IFFieldControlProps {
    /** Whether the border is drawn around the control. */
    readonly border?: FControlBorderVisibility;
    /** Which edges of the border are drawn when the border is visible. */
    readonly borderEdges?: FControlBorderEdges;
    /** Visual style of the border. */
    readonly borderStyle?: FControlBorderStyle;
    /** Helper text rendered below the control. */
    readonly description?: string;
    /** Exact height in pixels. The control content is stretched to fill this height rather than overflowing it. */
    readonly height?: number;
    /** Label text displayed above the control. */
    readonly label?: string;
    /** ID of the input the label is associated with, used as the label's htmlFor. */
    readonly labelFor?: string;
    /** Font weight of the label text. */
    readonly labelFontWeight?: FControlLabelFontWeight;
    /** Text case transform applied to the label. */
    readonly labelTextCase?: FControlLabelTextCase;
    /** Whether a required indicator is shown next to the label. */
    readonly required?: boolean;
    /** Exact width in pixels. */
    readonly width?: number;
}

function getBorderEdges(edges: FControlBorderEdges): Record<FControlBorderEdge, boolean> {
    const allEdges: FControlBorderEdge[] = ["top", "right", "bottom", "left"];
    const map = {} as Record<FControlBorderEdge, boolean>;

    allEdges.forEach(edge => {
        map[edge] = edges === "all" || (Array.isArray(edges) && edges.includes(edge));
    });

    return map;
}

/** A field control wraps input and provides support for labels and validation feedback. */
export default function FFieldControl({
    border = "visible",
    borderEdges = "all",
    description,
    height,
    label,
    labelFor,
    labelFontWeight = "normal",
    labelTextCase = "uppercase",
    required = false,
    width,
    children
}: React.PropsWithChildren<IFFieldControlProps>): React.JSX.Element {
    const edges = getBorderEdges(borderEdges);
    const style: React.CSSProperties = {};

    if (width !== undefined) {
        style.width = width;
        style.flexShrink = 0;
    }

    if (height !== undefined) {
        style.height = height;
        style.flexShrink = 0;
    }

    return (
        <div style={style} className={buildClasses(
            "f-field-control position-relative border-dark",
            border === "hidden" ? "border-0" : "",
            border === "visible" && edges.top ? "border-top" : "",
            border === "visible" && edges.right ? "border-end" : "",
            border === "visible" && edges.bottom ? "border-bottom" : "",
            border === "visible" && edges.left ? "border-start" : ""
        )}>
            {label && (
                <label htmlFor={labelFor} className={buildClasses(
                    "f-field-control-label", "form-label", "position-absolute", "ms-1", "mb-0", "fs-6",
                    labelFontWeight === "bold" ? "fw-bold" : "",
                    labelTextCase === "uppercase" ? "text-uppercase" : "",
                    labelTextCase === "capitalize" ? "text-capitalize" : ""
                )}>
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="f-field-control-content">
                {children}
            </div>
            {description && (
                <small className="form-text text-muted d-inline-block">{description}</small>
            )}
        </div>
    );
}
