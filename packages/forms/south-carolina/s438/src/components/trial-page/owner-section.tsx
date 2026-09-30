import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { TrialOwnerSectionModel } from "../../models/trial-page/owner-section";

interface ITrialOwnerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialOwnerSectionModel>;
}

/** Defines the vehicle owner section for the trial page of the S438 citation form. */
export default function TrialOwnerSection({ binding }: ITrialOwnerSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getFirstName()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                <FTextField field={section.getMiddleName()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                <FTextField field={section.getLastName()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.lastName, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getStreetAddress()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
                <FTextField field={section.getCity()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} />
                <FTextField field={section.getState()} width={98} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.state, value)} />
                <FTextField field={section.getZipCode()} width={147} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
