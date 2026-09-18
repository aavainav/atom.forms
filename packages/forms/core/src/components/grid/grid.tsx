import * as React from "react";

import { FContainer } from "../container";
import { FGridColumn } from "./grid-column";
import { FGridRow } from "./grid-row";

export type FGridType = "normal" | "fluid";
export type FGridOrientation = "horizontal" | "vertical";

interface IFGridProps {
    /** An indicator on whether the container has gutters (spacing) or not; default to true. */
    // TODO: add props for changing gutter sizes?
    readonly gutters?: boolean;
    /** An indicator on whether the column should fill the full height of the viewport; default to false. */
    readonly fill?: boolean;
    /** An optional orientation for the grid. It will use the default f-container orientation if nothing is passed. */
    readonly orientation?: FGridOrientation;
    /** The type of grid, normal spacing, or span the entire width (fluid); default to normal. */
    readonly type?: FGridType;
}

/** Defines the grid component. */
export default function FGrid({ gutters = true, fill = false, orientation, type = "normal", children }: React.PropsWithChildren<IFGridProps>): React.JSX.Element {
    return (
        <FContainer type={type} orientation={orientation} gutters={gutters} fill={fill}>
            {children}
        </FContainer>
    );
}

FGrid.Row = FGridRow;
FGrid.Column = FGridColumn;