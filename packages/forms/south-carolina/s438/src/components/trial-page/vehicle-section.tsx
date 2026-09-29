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
                <div className="w-100">
                    <FTextField field={section.getLicenseNumber()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseNumber, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getLicenseState()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseState, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getMake()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.make, value)} />
                </div>
                <div className="w-100">
                    <FNumberField field={section.getYear()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.year, value)} />
                </div>
            </FFormStackPanel>
            <FBorder borderEdges={["left", "top", "right"]} contentJustify="evenly">
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
