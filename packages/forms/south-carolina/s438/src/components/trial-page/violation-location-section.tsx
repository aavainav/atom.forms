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
                <div className="w-100">
                    <FTextField field={section.getLocation()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.location, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getCounty()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.county, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getLatitude()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.latitude, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getLongitude()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.longitude, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getCity()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.city, value)} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
