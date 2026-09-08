import * as React from "react";
import { buildClasses } from "../../utils/class-names";

type FOffCanvasHeaderBorderVisibility = "visible" | "hidden";

export interface IFOffCanvasHeaderProps {
    /** An optional type for showing or hiding a border in the off canvas header component; default to hidden. */
    readonly borderVisibility?: FOffCanvasHeaderBorderVisibility;
    /** Invoked when the close button is clicked. */
    readonly onClose: () => void;
}

export const FOffCanvasHeader = ({ borderVisibility = "hidden", onClose, children }: React.PropsWithChildren<IFOffCanvasHeaderProps>): React.JSX.Element => {
    return (
        <div className={buildClasses(
            "f-offcanvas__header",
            "offcanvas-header",
            borderVisibility === "visible" ? "border-bottom" : ""
        )}>
            {children}
            <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
                onClick={onClose}
            />
        </div>
    );
}
