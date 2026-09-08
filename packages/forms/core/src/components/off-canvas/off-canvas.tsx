import React from "react";

import { FOffCanvasBody } from "./off-canvas-body";
import { FOffCanvasHeader } from "./off-canvas-header";

interface IFOffCanvasProps {
    /** The unique identifier for the off canvas. */
    readonly id: string;
    /** Whether the off canvas is currently shown. */
    readonly isOpen: boolean;
}

export default function FOffCanvas({ id, isOpen, children }: React.PropsWithChildren<IFOffCanvasProps>): React.JSX.Element {
    return (
        <div id={`${id}__offcanvas`} className={`offcanvas offcanvas-start ${isOpen ? "show" : ""}`} tabIndex={-1} aria-labelledby="offcanvasLabel">
            {children}
        </div>
    );
}

FOffCanvas.Header = FOffCanvasHeader;
FOffCanvas.Body = FOffCanvasBody;
