import React from "react";
import { ISectionBinding, FFormStackPanel, FNumberField, FSection, FTextField } from "@forms/core";

import { VehicleSectionModel } from "../../models/front-page/vehicle-section";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
}

/** Defines the vehicle section for the front page of the S438 citation form. */
export default function VehicleSection({ binding }: IVehicleSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getLicenseNumber()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseNumber, value)} />
                <FTextField field={section.getLicenseState()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseState, value)} />
                <FTextField field={section.getMake()} width={147} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.make, value)} />
                <FNumberField field={section.getYear()} width={147} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.year, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
