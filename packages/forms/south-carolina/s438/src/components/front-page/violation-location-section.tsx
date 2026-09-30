import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { ViolationLocationSectionModel } from "../../models/front-page/violation-location-section";

interface IViolationLocationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationLocationSectionModel>;
}

/** Defines the violation location section for the front page of the S438 citation form. */
export default function ViolationLocationSection({ binding }: IViolationLocationSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLocation()} width={392} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.violationLocation, value)} />
                <FTextField field={section.getCounty()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.violationLocationCounty, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLatitude()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.violationLocationLatitude, value)} />
                <FTextField field={section.getLongitude()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.violationLocationLongitude, value)} />
                <FTextField field={section.getCity()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.violationLocationCity, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
