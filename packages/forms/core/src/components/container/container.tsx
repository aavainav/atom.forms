import * as React from "react";
import { buildClasses } from "../../utils/class-names";
import { FPaddingSize, IFPadding, getPaddingStyle } from "../../utils/spacing";

export type FContainerBackgroundColor = "primary" |
    "secondary" |
    "success" |
    "info" |
    "warning" |
    "danger" |
    "light" |
    "dark" |
    "white" |
    "transparent";
export type FContainerType = "normal" | "fluid";
export type FOrientation = "horizontal" | "vertical" | "none";

interface IFContainerProps {
    /** An optional unique identifier for the container. */
    readonly id?: string;
    // An optional background color for the container; default to transparent.
    readonly backgroundColor?: FContainerBackgroundColor;
    // An optional indicator to make the background rounded; default to true.
    readonly backgroundRounded?: boolean;
    /** An indicator on whether the container should fill the full height of the viewport; default to false. */
    readonly fill?: boolean;
    /** An indicator on whether the container has gutters (spacing) or not; default to true. */
    // TODO: add props for changing gutter sizes?
    readonly gutters?: boolean;
    /** The direction in which the child elements are displayed. */
    readonly orientation?: FOrientation;
    /** Padding applied to the container. A bare size applies to all four sides. */
    readonly padding?: FPaddingSize | IFPadding;
    /** The type of container, normal spacing, or span the entire width (fluid); default to normal. */
    readonly type?: FContainerType;
}

/** The basic container for layouts. The default container type is normal, and not to fill. */
export default function FContainer({
    id,
    backgroundColor = "transparent",
    backgroundRounded = true,
    fill = false,
    gutters = true,
    orientation = "vertical",
    padding,
    type = "normal",
    children
}: React.PropsWithChildren<IFContainerProps>): React.JSX.Element {
    return (
        <div
            id={id}
            style={getPaddingStyle(undefined, padding)}
            className={buildClasses(
                "f-container",
                type === "fluid" ? "container-fluid" : "container",
                orientation === "horizontal" ? "d-flex" : "",
                `bg-${backgroundColor}`,
                backgroundRounded ? "rounded": "",
                !gutters ? "g-0" : "",
                fill ? "h-100" : ""
            )}
        >
            {children}
        </div>
    );
}