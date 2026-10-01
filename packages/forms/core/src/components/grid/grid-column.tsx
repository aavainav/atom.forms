import * as React from "react";
import { buildClasses } from "../../utils/class-names";

export interface IFGridColumnProps {
    /** An indicator on whether to auto size the column width; default to false. */
    readonly auto?: boolean;
    /** An indicator on whether the column should fill the full height of the viewport; default to false. */
    readonly fill?: boolean;
    /** Keeps the content on one line, cutting it off with an ellipsis when it runs past the column; default to false. */
    readonly truncate?: boolean;
}

/** Defines the grid column component. */
export const FGridColumn = ({ auto = false, fill = false, truncate = false, children }: React.PropsWithChildren<IFGridColumnProps>): React.JSX.Element => {
    return (
        <div className={
            buildClasses(
                "col", 
                auto ? "col-auto" : "",
                fill ? "h-100" : "",
                truncate ? "text-truncate" : ""
        )}>
            {children}
        </div>
    );
}