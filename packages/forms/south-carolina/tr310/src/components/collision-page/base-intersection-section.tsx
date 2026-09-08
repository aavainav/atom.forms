import React from "react";
import { ISectionBinding, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { BaseIntersectionSectionModel } from "../../models/collision-page/base-intersection-section";
import { TextField } from "../fields";

interface IBaseIntersectionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<BaseIntersectionSectionModel>;
}

/** Defines the base route and base intersection section of the TR-310, the junction the collision's distance offset is measured from. */
export const BaseIntersectionSection = ({ binding }: IBaseIntersectionSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">BASE ROUTE CATEGORY / BASE INTERSECTION</span></FLabel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getCategory()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.category, value)} />
                <TextField field={section.getAuxiliary()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.auxiliary, value)} />
                <TextField field={section.getRouteNumber()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.routeNumber, value)} />
                <TextField field={section.getRouteName()} width={320} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.routeName, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
