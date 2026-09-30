import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialVehicleSectionModel } from "../../models/trial-page/vehicle-section";
import CheckboxField from "./checkbox-field";

interface ITrialVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialVehicleSectionModel>;
}

/** Defines the vehicle section for the trial page of the S438 citation form. */
export default function TrialVehicleSection({ binding }: ITrialVehicleSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLicenseNumber()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseNumber, value)} />
                <FTextField field={section.getLicenseState()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseState, value)} />
                <FTextField field={section.getMake()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.make, value)} />
                <FNumberField field={section.getYear()} width={147} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.year, value)} />
            </FFormStackPanel>
            <FBorder width={588} borderEdges={["left", "top", "right"]} contentJustify="evenly">
                <CheckboxField field={section.getHazardousMaterials()} onChange={(checked) => binding.setValue(section.hazardousMaterials, checked)} />
                <CheckboxField field={section.getAuto()} onChange={(checked) => binding.setValue(section.auto, checked)} />
                <CheckboxField field={section.getBicycle()} onChange={(checked) => binding.setValue(section.bicycle, checked)} />
                <CheckboxField field={section.getMoped()} onChange={(checked) => binding.setValue(section.moped, checked)} />
                <CheckboxField field={section.getMotorcycle()} onChange={(checked) => binding.setValue(section.motorcycle, checked)} />
                <CheckboxField field={section.getCombination()} onChange={(checked) => binding.setValue(section.combination, checked)} />
                <CheckboxField field={section.getPedestrian()} onChange={(checked) => binding.setValue(section.pedestrian, checked)} />
                <CheckboxField field={section.getCommercial()} onChange={(checked) => binding.setValue(section.commercial, checked)} />
                <CheckboxField field={section.getOther()} onChange={(checked) => binding.setValue(section.other, checked)} />
            </FBorder>
        </FSection>
    );
}
