import React from "react";
import { ISectionBinding, FBorder, FFieldCheckbox, FFieldControl, FFieldInput, FLabel, FFormStackPanel, FSection } from "@forms/core";

import { ViolatorSectionModel } from "../../models/front-page/violator-section";

interface IViolatorSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolatorSectionModel>;
}

/** Defines the violator section for the front page of the S438 citation form. */
export default function ViolatorSection({ binding }: IViolatorSectionProps): React.JSX.Element {
    const section = binding.get();
    const firstName = section.getFirstName();
    const middleName = section.getMiddleName();
    const lastName = section.getLastName();
    const streetAddress = section.getStreetAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();
    const driverLicenseState = section.getDriverLicenseState();
    const driverLicenseNumber = section.getDriverLicenseNumber();
    const driverLicenseClass = section.getDriverLicenseClass();
    const commercialDriverLicenseYes = section.getCommercialDriverLicenseYes();
    const commercialDriverLicenseNo = section.getCommercialDriverLicenseNo();
    const dateOfBirth = section.getDateOfBirth();
    const height = section.getHeight();
    const weight = section.getWeight();
    const hairColor = section.getHairColor();
    const eyeColor = section.getEyeColor();

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
                    <FFieldControl label={middleName.label} labelFor={middleName.id} borderEdges={["top"]}>
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
                    <FFieldControl label={lastName.label} labelFor={lastName.id} borderEdges={["top", "right"]}>
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
                <div className="w-50">
                    <FFieldControl label={state.label} labelFor={state.id} borderEdges={["top"]}>
                        <FFieldInput
                            id={state.id}
                            disabled={!state.getIsEnabled()}
                            invalid={state.getHasError()}
                            value={state.getValue()}
                            onChange={(value) => binding.setValue(section.state, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-50">
                    <FFieldControl label={zipCode.label} labelFor={zipCode.id} borderEdges={["top", "right"]}>
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
            <FFormStackPanel direction="horizontal">
                <div className="w-25">
                    <FFieldControl label={driverLicenseState.label} labelFor={driverLicenseState.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={driverLicenseState.id}
                            disabled={!driverLicenseState.getIsEnabled()}
                            invalid={driverLicenseState.getHasError()}
                            value={driverLicenseState.getValue()}
                            onChange={(value) => binding.setValue(section.driverLicenseState, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={driverLicenseNumber.label} labelFor={driverLicenseNumber.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={driverLicenseNumber.id}
                            disabled={!driverLicenseNumber.getIsEnabled()}
                            invalid={driverLicenseNumber.getHasError()}
                            value={driverLicenseNumber.getValue()}
                            onChange={(value) => binding.setValue(section.driverLicenseNumber, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-25">
                    <FFieldControl label={driverLicenseClass.label} labelFor={driverLicenseClass.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={driverLicenseClass.id}
                            disabled={!driverLicenseClass.getIsEnabled()}
                            invalid={driverLicenseClass.getHasError()}
                            value={driverLicenseClass.getValue()}
                            onChange={(value) => binding.setValue(section.driverLicenseClass, value)}
                        />
                    </FFieldControl>
                </div>
                <FBorder borderEdges={["left", "top", "right"]}>
                    <FLabel fontSize="6">CDL</FLabel>
                    <div className="d-flex justify-content-evenly">
                        <FFieldCheckbox
                            id={commercialDriverLicenseYes.id}
                            label={commercialDriverLicenseYes.label}
                            checked={commercialDriverLicenseYes.getValue() as boolean}
                            disabled={!commercialDriverLicenseYes.getIsEnabled()}
                            onChange={(checked) => binding.setValue(section.commercialDriverLicenseYes, checked)}
                        />
                        <FFieldCheckbox
                            id={commercialDriverLicenseNo.id}
                            label={commercialDriverLicenseNo.label}
                            checked={commercialDriverLicenseNo.getValue() as boolean}
                            disabled={!commercialDriverLicenseNo.getIsEnabled()}
                            onChange={(checked) => binding.setValue(section.commercialDriverLicenseNo, checked)}
                        />
                    </div>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                {/* race/sex are not yet wired to a dropdown input */}
                <div className="w-100">
                    <FFieldControl label={dateOfBirth.label} labelFor={dateOfBirth.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={dateOfBirth.id}
                            disabled={!dateOfBirth.getIsEnabled()}
                            invalid={dateOfBirth.getHasError()}
                            value={dateOfBirth.getValue()}
                            onChange={(value) => binding.setValue(section.dateOfBirth, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={height.label} labelFor={height.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={height.id}
                            disabled={!height.getIsEnabled()}
                            invalid={height.getHasError()}
                            value={height.getValue()}
                            onChange={(value) => binding.setValue(section.height, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={weight.label} labelFor={weight.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={weight.id}
                            disabled={!weight.getIsEnabled()}
                            invalid={weight.getHasError()}
                            value={weight.getValue()}
                            onChange={(value) => binding.setValue(section.weight, Number(value))}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={hairColor.label} labelFor={hairColor.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={hairColor.id}
                            disabled={!hairColor.getIsEnabled()}
                            invalid={hairColor.getHasError()}
                            value={hairColor.getValue()}
                            onChange={(value) => binding.setValue(section.hairColor, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={eyeColor.label} labelFor={eyeColor.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={eyeColor.id}
                            disabled={!eyeColor.getIsEnabled()}
                            invalid={eyeColor.getHasError()}
                            value={eyeColor.getValue()}
                            onChange={(value) => binding.setValue(section.eyeColor, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
