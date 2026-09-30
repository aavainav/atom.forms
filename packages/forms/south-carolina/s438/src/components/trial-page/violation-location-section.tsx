import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { TrialViolationLocationSectionModel } from "../../models/trial-page/violation-location-section";

interface ITrialViolationLocationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialViolationLocationSectionModel>;
}

/** Defines the violation location section for the trial page of the S438 citation form. */
export default function TrialViolationLocationSection({ binding }: ITrialViolationLocationSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLocation()} width={392} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.location, value)} />
                <FTextField field={section.getCounty()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.county, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLatitude()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.latitude, value)} />
                <FTextField field={section.getLongitude()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.longitude, value)} />
                <FTextField field={section.getCity()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.city, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
