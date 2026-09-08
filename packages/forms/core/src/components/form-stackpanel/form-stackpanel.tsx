import React from "react";
import { buildClasses } from "../../utils/class-names";

export type StackPanelDirection = "vertical" | "horizontal";

interface IFFormStackPanelProps {
    readonly direction?: StackPanelDirection;
    /** Exact height in pixels. The children are stretched to fill this height rather than overflowing it. */
    readonly height?: number;
}

export default function FFormStackPanel({ direction = "vertical", height, children }: React.PropsWithChildren<IFFormStackPanelProps>): React.JSX.Element {
    const style: React.CSSProperties = {};

    if (height !== undefined) {
        style.height = height;
        style.flexShrink = 0;
    }

    return (
        <div style={style} className={buildClasses("f-form-stackpanel", "d-flex", direction === "horizontal" ? "flex-row" : "flex-column")}>
            {children}
        </div>
    );
}