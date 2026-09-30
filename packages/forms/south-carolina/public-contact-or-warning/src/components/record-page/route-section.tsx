import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { RouteSectionModel } from "../../models/record-page/route-section";

interface IRouteSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RouteSectionModel>;
}

/** Defines the route section of the public contact/warning record. */
export const RouteSection = ({ binding }: IRouteSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FTextField field={section.getType()} borderEdges={["top"]} width={75} onChange={(value) => binding.setValue(section.type, value)} />
                <FTextField field={section.getNumberOrName()} borderEdges={["left", "top"]} width={513} onChange={(value) => binding.setValue(section.numberOrName, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
