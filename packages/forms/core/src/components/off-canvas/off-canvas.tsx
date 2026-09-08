import React from "react";

import { useFOffCanvas } from "./context";
import { FOffCanvasBody } from "./off-canvas-body";
import { FOffCanvasHeader } from "./off-canvas-header";

interface IFOffCanvasProps {
    /** The unique identifier for the off canvas. */
    readonly id: string;
}

export default function FOffCanvas({ id, children }: React.PropsWithChildren<IFOffCanvasProps>): React.JSX.Element {
    const context = useFOffCanvas();

    return (
        <div id={`${id}__offcanvas`} className={`offcanvas offcanvas-start ${context.showOffCanvas ? "show" : ""}`} tabIndex={-1} aria-labelledby="offcanvasLabel">
            {children}
        </div>
    );
}

FOffCanvas.Header = FOffCanvasHeader;
FOffCanvas.Body = FOffCanvasBody;
