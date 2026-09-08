import React from "react";
import { ISectionBinding, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { SecondIntersectionSectionModel } from "../../models/collision-page/second-intersection-section";
import { TextField } from "../fields";

interface ISecondIntersectionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<SecondIntersectionSectionModel>;
}

/** Defines the second route and second intersection section of the TR-310, recorded when the collision occurred where two routes meet. */
export const SecondIntersectionSection = ({ binding }: ISecondIntersectionSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">SECOND ROUTE CATEGORY / SECOND INTERSECTION</span></FLabel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getCategory()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.category, value)} />
                <TextField field={section.getAuxiliary()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.auxiliary, value)} />
                <TextField field={section.getRouteNumber()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.routeNumber, value)} />
                <TextField field={section.getRouteName()} width={320} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.routeName, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
