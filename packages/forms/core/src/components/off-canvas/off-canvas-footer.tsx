import * as React from "react";

import type { FBorderContentAlignment, FBorderContentJustify, FBorderVisibility } from "../border/border";

import { buildClasses } from "../../utils/class-names";
import { FPaddingSize, IFPadding, getPaddingStyle } from "../../utils/spacing";

/** The way the footer lays its content out: side by side, or one above the next. */
export type FOffCanvasFooterDirection = "horizontal" | "vertical";

export interface IFOffCanvasFooterProps {
    /** Whether a border is drawn above the footer; defaults to hidden. */
    readonly borderVisibility?: FBorderVisibility;
    /** Vertical alignment of the content, across the direction it is laid out in. Left as the browser has it when it is not given. */
    readonly contentAlignment?: FBorderContentAlignment;
    /** Horizontal alignment of the content, along the direction it is laid out in. Left as the browser has it when it is not given. */
    readonly contentJustify?: FBorderContentJustify;
    /** The direction the content is laid out in; defaults to horizontal. */
    readonly direction?: FOffCanvasFooterDirection;
    /** An optional unique identifier for the footer. */
    readonly id?: string;
    /** The padding, in pixels. A bare size applies to all four sides; defaults to 16 on all four. */
    readonly padding?: FPaddingSize | IFPadding;
}

/** The footer of an off canvas: pinned beneath the body, which scrolls, so that what it holds -- a panel's actions -- stays in reach. */
export const FOffCanvasFooter = ({ borderVisibility = "hidden", contentAlignment, contentJustify, direction = "horizontal", id, padding, children }: React.PropsWithChildren<IFOffCanvasFooterProps>): React.JSX.Element => {
    return (
        <div
            id={id}
            className={buildClasses(
                "f-offcanvas__footer",
                "d-flex",
                direction === "vertical" ? "flex-column" : "flex-row",
                borderVisibility === "visible" ? "border-top" : "",
                contentAlignment ? `align-items-${contentAlignment}` : "",
                contentJustify ? `justify-content-${contentJustify}` : ""
            )}
            style={getPaddingStyle({ all: 16 }, padding)}>
            {children}
        </div>
    );
}
