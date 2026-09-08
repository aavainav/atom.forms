import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { CourtSectionModel } from "../../models/front-page/court-section";

interface ICourtSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CourtSectionModel>;
}

/** Defines the court section for the front page of the S438 citation form. */
export default function CourtSection({ binding }: ICourtSectionProps): React.JSX.Element {
    const section = binding.get();
    const courtName = section.getCourtName();
    const streetAddress = section.getStreetAddress();
    const dateOfTrial = section.getDateOfTrial();
    const timeOfTrial = section.getTimeOfTrial();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={courtName.label} labelFor={courtName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={courtName.id}
                            disabled={!courtName.getIsEnabled()}
                            invalid={courtName.getHasError()}
                            value={courtName.getValue()}
                            onChange={(value) => binding.setValue(section.courtName, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={streetAddress.label} labelFor={streetAddress.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={streetAddress.id}
                            disabled={!streetAddress.getIsEnabled()}
                            invalid={streetAddress.getHasError()}
                            value={streetAddress.getValue()}
                            onChange={(value) => binding.setValue(section.streetAddress, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={dateOfTrial.label} labelFor={dateOfTrial.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={dateOfTrial.id}
                            disabled={!dateOfTrial.getIsEnabled()}
                            invalid={dateOfTrial.getHasError()}
                            value={dateOfTrial.getValue()}
                            onChange={(value) => binding.setValue(section.dateOfTrial, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={timeOfTrial.label} labelFor={timeOfTrial.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={timeOfTrial.id}
                            disabled={!timeOfTrial.getIsEnabled()}
                            invalid={timeOfTrial.getHasError()}
                            value={timeOfTrial.getValue()}
                            onChange={(value) => binding.setValue(section.timeOfTrial, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={city.label} labelFor={city.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={city.id}
                            disabled={!city.getIsEnabled()}
                            invalid={city.getHasError()}
                            value={city.getValue()}
                            onChange={(value) => binding.setValue(section.city, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={state.label} labelFor={state.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={state.id}
                            disabled={!state.getIsEnabled()}
                            invalid={state.getHasError()}
                            value={state.getValue()}
                            onChange={(value) => binding.setValue(section.state, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={zipCode.label} labelFor={zipCode.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={zipCode.id}
                            disabled={!zipCode.getIsEnabled()}
                            invalid={zipCode.getHasError()}
                            value={zipCode.getValue()}
                            onChange={(value) => binding.setValue(section.zipCode, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
