import React from "react";
import { ISectionBinding, FBorder, FCheckboxField, FFormStackPanel, FLabel, FNumberField, FSection, FTextField } from "@forms/core";

import { ViolatorSectionModel } from "../../models/front-page/violator-section";

interface IViolatorSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolatorSectionModel>;
}

/** Defines the violator section for the front page of the S438 citation form. */
export default function ViolatorSection({ binding }: IViolatorSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getFirstName()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                <FTextField field={section.getMiddleName()} width={196} borderEdges={["top"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                <FTextField field={section.getLastName()} width={196} borderEdges={["top", "right"]} onChange={(value) => binding.setValue(section.lastName, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getStreetAddress()} width={588} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.streetAddress, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getCity()} width={294} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} />
                <FTextField field={section.getState()} width={147} borderEdges={["top"]} onChange={(value) => binding.setValue(section.state, value)} />
                <FTextField field={section.getZipCode()} width={147} borderEdges={["top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getDriverLicenseState()} width={88} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseState, value)} />
                <FTextField field={section.getDriverLicenseNumber()} width={300} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseNumber, value)} />
                <FTextField field={section.getDriverLicenseClass()} width={80} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.driverLicenseClass, value)} />
                <FBorder width={120} borderEdges={["left", "top", "right"]}>
                    <FLabel fontSize="6" margin={{ start: 5 }}>CDL</FLabel>
                    <FBorder border="hidden" contentJustify="evenly">
                        <FCheckboxField field={section.getCommercialDriverLicenseYes()} onChange={(checked) => binding.setValue(section.commercialDriverLicenseYes, checked)} />
                        <FCheckboxField field={section.getCommercialDriverLicenseNo()} onChange={(checked) => binding.setValue(section.commercialDriverLicenseNo, checked)} />
                    </FBorder>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                {/* race/sex are not yet wired to a dropdown input */}
                <FTextField field={section.getDateOfBirth()} width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
                <FTextField field={section.getHeight()} width={100} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.height, value)} />
                <FNumberField field={section.getWeight()} width={100} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.weight, value)} />
                <FTextField field={section.getHairColor()} width={124} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.hairColor, value)} />
                <FTextField field={section.getEyeColor()} width={124} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.eyeColor, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
