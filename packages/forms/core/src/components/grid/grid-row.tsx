import * as React from "react";
import { buildClasses } from "../../utils/class-names";

export interface IFGridRowProps {
    /** An indicator on whether the row should fill the full height of the viewport; default to false. */
    readonly fill?: boolean;
}

/** Defines the grid row component. */
export const FGridRow = ({ fill, children }: React.PropsWithChildren<IFGridRowProps>): React.JSX.Element => {
    return (
        <div className={
            buildClasses(
                "row", 
                fill ? "h-100" : ""
        )}>
            {children}
        </div>
    );
}