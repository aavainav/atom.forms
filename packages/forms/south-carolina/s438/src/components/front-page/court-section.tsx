import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { CourtSectionModel } from "../../models/front-page/court-section";

interface ICourtSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CourtSectionModel>;
}

/** Defines the trial court section for the front page of the S438 citation form. */
export default function CourtSection({ binding }: ICourtSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getCourtName()} width={294} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.courtName, value)} />
                <FTextField field={section.getStreetAddress()} width={294} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getDateOfTrial()} width={118} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfTrial, value)} />
                <FTextField field={section.getTimeOfTrial()} width={118} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.timeOfTrial, value)} />
                <FTextField field={section.getCity()} width={118} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} />
                <FTextField field={section.getState()} width={117} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.state, value)} />
                <FTextField field={section.getZipCode()} width={117} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
