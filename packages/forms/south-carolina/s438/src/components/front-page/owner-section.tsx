import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection,  } from "@forms/core";

import { OwnerSectionModel } from "../../models/front-page/owner-section";

interface IOwnerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OwnerSectionModel>;
}

/** Defines the owner section for the front page of the S438 citation form. */
export default function OwnerSection({ binding }: IOwnerSectionProps): React.JSX.Element {
    const section = binding.get();
    const firstName = section.getFirstName();
    const middleName = section.getMiddleName();
    const lastName = section.getLastName();
    const streetAddress = section.getStreetAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={firstName.label} labelFor={firstName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={firstName.id}
                            disabled={!firstName.getIsEnabled()}
                            invalid={firstName.getHasError()}
                            value={firstName.getValue()}
                            onChange={(value) => binding.setValue(section.firstName, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={middleName.label} labelFor={middleName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={middleName.id}
                            disabled={!middleName.getIsEnabled()}
                            invalid={middleName.getHasError()}
                            value={middleName.getValue()}
                            onChange={(value) => binding.setValue(section.middleName, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={lastName.label} labelFor={lastName.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={lastName.id}
                            disabled={!lastName.getIsEnabled()}
                            invalid={lastName.getHasError()}
                            value={lastName.getValue()}
                            onChange={(value) => binding.setValue(section.lastName, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={streetAddress.label} labelFor={streetAddress.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={streetAddress.id}
                            disabled={!streetAddress.getIsEnabled()}
                            invalid={streetAddress.getHasError()}
                            value={streetAddress.getValue()}
                            onChange={(value) => binding.setValue(section.streetAddress, value)}
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
