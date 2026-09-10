import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FBorderContentAlignment = "start" | "center" | "end" | "baseline" | "stretch";
export type FBorderContentJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type FBorderEdge = "all" | "top" | "right" | "bottom" | "left";
export type FBorderEdges = FBorderEdge | FBorderEdge[];
export type FBorderVisibility = "visible" | "hidden";

interface IFBorderProps {
    readonly border?: FBorderVisibility;
    /** The edges to apply the border to; pass an array (e.g. `["top", "bottom"]`) or "all". Defaults to "all". */
    readonly borderEdges?: FBorderEdges;
    /** Vertical alignment of content using Bootstrap align-items utilities. */
    readonly contentAlignment?: FBorderContentAlignment;
    /** Horizontal alignment of content using Bootstrap justify-content utilities. */
    readonly contentJustify?: FBorderContentJustify;
    /** Exact height in pixels. The content is stretched to fill this height rather than overflowing it. */
    readonly height?: number;
    /** Exact width in pixels. */
    readonly width?: number;
}

function getBorderEdges(edges: FBorderEdges): Record<FBorderEdge, boolean> {
    const allEdges: FBorderEdge[] = ["top", "right", "bottom", "left"];
    const map = {} as Record<FBorderEdge, boolean>;

    allEdges.forEach(edge => {
        map[edge] = edges === "all" || (Array.isArray(edges) && edges.includes(edge));
    });

    return map;
}

export default function FBorder({ 
    border = "visible", 
    borderEdges = "all", 
    contentAlignment, 
    contentJustify, 
    height, 
    width, 
    children 
}: React.PropsWithChildren<IFBorderProps>): React.JSX.Element {
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

    const alignClass = contentAlignment ? `align-items-${contentAlignment}` : "";
    const justifyClass = contentJustify ? `justify-content-${contentJustify}` : "";
    const flexClass = (contentJustify || contentAlignment) ? "d-flex" : "";

    return (
        <div style={style} className={buildClasses(
            "border-dark",
            border === "hidden" ? "border-0" : "",
            border === "visible" && edges.top ? "border-top" : "",
            border === "visible" && edges.right ? "border-end" : "",
            border === "visible" && edges.bottom ? "border-bottom" : "",
            border === "visible" && edges.left ? "border-start" : ""
        )}>
            <div className={buildClasses("f-border-content", flexClass, justifyClass, alignClass)}>
                {children}
            </div>
        </div>
    );
}
