import React from "react";
import { ISectionBinding, FBorder, FCheckboxField, FFormStackPanel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialVehicleSectionModel } from "../../models/trial-page/vehicle-section";

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
                <FCheckboxField field={section.getHazardousMaterials()} onChange={(checked) => binding.setValue(section.hazardousMaterials, checked)} />
                <FCheckboxField field={section.getAuto()} onChange={(checked) => binding.setValue(section.auto, checked)} />
                <FCheckboxField field={section.getBicycle()} onChange={(checked) => binding.setValue(section.bicycle, checked)} />
                <FCheckboxField field={section.getMoped()} onChange={(checked) => binding.setValue(section.moped, checked)} />
                <FCheckboxField field={section.getMotorcycle()} onChange={(checked) => binding.setValue(section.motorcycle, checked)} />
                <FCheckboxField field={section.getCombination()} onChange={(checked) => binding.setValue(section.combination, checked)} />
                <FCheckboxField field={section.getPedestrian()} onChange={(checked) => binding.setValue(section.pedestrian, checked)} />
                <FCheckboxField field={section.getCommercial()} onChange={(checked) => binding.setValue(section.commercial, checked)} />
                <FCheckboxField field={section.getOther()} onChange={(checked) => binding.setValue(section.other, checked)} />
            </FBorder>
        </FSection>
    );
}
