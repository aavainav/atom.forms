import React from "react";

import { FOffCanvasBody } from "./off-canvas-body";
import { FOffCanvasHeader } from "./off-canvas-header";

import { buildClasses } from "../../utils/class-names";

/** The edge of the viewport an off canvas slides in from. */
export type FOffCanvasPlacement = "start" | "end";

interface IFOffCanvasProps {
    /** The unique identifier for the off canvas. */
    readonly id: string;
    /** Whether the off canvas is currently shown. */
    readonly isOpen: boolean;
    /** The edge the off canvas slides in from; two panels that can be open at once need different edges, or they cover each other. */
    readonly placement?: FOffCanvasPlacement;
}

export default function FOffCanvas({ id, isOpen, placement = "start", children }: React.PropsWithChildren<IFOffCanvasProps>): React.JSX.Element {
    return (
        <div id={`${id}__offcanvas`} className={buildClasses("offcanvas", `offcanvas-${placement}`, isOpen && "show")} tabIndex={-1} aria-labelledby="offcanvasLabel">
            {children}
        </div>
    );
}

FOffCanvas.Header = FOffCanvasHeader;
FOffCanvas.Body = FOffCanvasBody;
