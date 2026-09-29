import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialViolatorSectionModel } from "../../models/trial-page/violator-section";
import CheckboxField from "./checkbox-field";

interface ITrialViolatorSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialViolatorSectionModel>;
}

/** Defines the violator section for the trial page of the S438 citation form. */
export default function TrialViolatorSection({ binding }: ITrialViolatorSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getFirstName()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getMiddleName()} borderEdges={["top"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getLastName()} borderEdges={["top", "right"]} onChange={(value) => binding.setValue(section.lastName, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getStreetAddress()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getCity()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} />
                </div>
                <div className="w-50">
                    <FTextField field={section.getState()} borderEdges={["top"]} onChange={(value) => binding.setValue(section.state, value)} />
                </div>
                <div className="w-50">
                    <FTextField field={section.getZipCode()} borderEdges={["top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-25">
                    <FTextField field={section.getDriverLicenseState()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseState, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getDriverLicenseNumber()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseNumber, value)} />
                </div>
                <div className="w-25">
                    <FTextField field={section.getDriverLicenseClass()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseClass, value)} />
                </div>
                <FBorder borderEdges={["left", "top", "right"]}>
                    <FLabel fontSize="6">CDL</FLabel>
                    <FBorder border="hidden" contentJustify="evenly">
                        <CheckboxField field={section.getCommercialDriverLicenseYes()} onChange={(checked) => binding.setValue(section.commercialDriverLicenseYes, checked)} />
                        <CheckboxField field={section.getCommercialDriverLicenseNo()} onChange={(checked) => binding.setValue(section.commercialDriverLicenseNo, checked)} />
                    </FBorder>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-50">
                    <FTextField field={section.getRace()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.race, value)} />
                </div>
                <div className="w-50">
                    <FTextField field={section.getSex()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.sex, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getDateOfBirth()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getHeight()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.height, value)} />
                </div>
                <div className="w-100">
                    <FNumberField field={section.getWeight()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.weight, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getHairColor()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.hairColor, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getEyeColor()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.eyeColor, value)} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
