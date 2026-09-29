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
                <div className="w-100">
                    <FTextField field={section.getFirstName()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getMiddleName()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getLastName()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.lastName, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getStreetAddress()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
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
