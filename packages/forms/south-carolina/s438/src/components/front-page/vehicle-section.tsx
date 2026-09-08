import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { VehicleSectionModel } from "../../models/front-page/vehicle-section";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
}

/** Defines the vehicle section for the front page of the S438 citation form. */
export default function VehicleSection({ binding }: IVehicleSectionProps): React.JSX.Element {
    const section = binding.get();
    const vehicleLicenseNumber = section.getLicenseNumber();
    const vehicleState = section.getLicenseState();
    const vehicleMake = section.getMake();
    const vehicleYear = section.getYear();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={vehicleLicenseNumber.label} labelFor={vehicleLicenseNumber.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={vehicleLicenseNumber.id}
                            disabled={!vehicleLicenseNumber.getIsEnabled()}
                            invalid={vehicleLicenseNumber.getHasError()}
                            value={vehicleLicenseNumber.getValue()}
                            onChange={(value) => binding.setValue(section.licenseNumber, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={vehicleState.label} labelFor={vehicleState.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={vehicleState.id}
                            disabled={!vehicleState.getIsEnabled()}
                            invalid={vehicleState.getHasError()}
                            value={vehicleState.getValue()}
                            onChange={(value) => binding.setValue(section.licenseState, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={vehicleMake.label} labelFor={vehicleMake.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={vehicleMake.id}
                            disabled={!vehicleMake.getIsEnabled()}
                            invalid={vehicleMake.getHasError()}
                            value={vehicleMake.getValue()}
                            onChange={(value) => binding.setValue(section.make, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={vehicleYear.label} labelFor={vehicleYear.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={vehicleYear.id}
                            disabled={!vehicleYear.getIsEnabled()}
                            invalid={vehicleYear.getHasError()}
                            value={vehicleYear.getValue()}
                            onChange={(value) => binding.setValue(section.year, Number(value))}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
