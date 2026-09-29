import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { TrialCourtSectionModel } from "../../models/trial-page/court-section";

interface ITrialCourtSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialCourtSectionModel>;
}

/** Defines the trial court section for the trial page of the S438 citation form. */
export default function TrialCourtSection({ binding }: ITrialCourtSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getCourtName()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.courtName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getStreetAddress()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getDateOfTrial()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfTrial, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getTimeOfTrial()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.timeOfTrial, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getCity()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getState()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.state, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getZipCode()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
