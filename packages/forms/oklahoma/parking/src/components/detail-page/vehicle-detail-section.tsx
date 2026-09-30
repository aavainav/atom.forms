import React from "react";
import { ISectionBinding, FFieldCheckbox, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { VehicleDetailSectionModel } from "../../models/detail-page/vehicle-detail-section";

interface IVehicleDetailSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleDetailSectionModel>;
}

/** Defines the vehicle detail section of the Oklahoma City parking violation form's detail page. */
export const VehicleDetailSection = ({ binding }: IVehicleDetailSectionProps): React.JSX.Element => {
    const section = binding.get();
    const vin = section.getVin();
    const registrationExpires = section.getRegistrationExpires();
    const year = section.getYear();
    const type = section.getType();
    const color = section.getColor();
    const model = section.getModel();
    const noLicensePlate = section.getNoLicensePlate();

    return (
        <FSection>
            <div className="fw-bold mt-3">VEHICLE</div>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={260} label={vin.label} labelFor={vin.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={vin.id}
                        alphanumeric
                        disabled={!vin.getIsEnabled()}
                        invalid={vin.getHasError()}
                        value={vin.getValue()}
                        onChange={(value) => binding.setValue(section.vin, value)}
                    />
                </FFieldControl>
                <FFieldControl width={170} label={registrationExpires.label} labelFor={registrationExpires.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={registrationExpires.id}
                        type="date"
                        disabled={!registrationExpires.getIsEnabled()}
                        invalid={registrationExpires.getHasError()}
                        value={registrationExpires.getValue()}
                        onChange={(value) => binding.setValue(section.registrationExpires, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={110} label={year.label} labelFor={year.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={year.id}
                        type="number"
                        disabled={!year.getIsEnabled()}
                        invalid={year.getHasError()}
                        value={year.getValue()}
                        onChange={(value) => binding.setValue(section.year, value === "" ? null : Number(value))}
                    />
                </FFieldControl>
                <FFieldControl width={160} label={type.label} labelFor={type.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={type.id}
                        disabled={!type.getIsEnabled()}
                        invalid={type.getHasError()}
                        value={type.getValue()}
                        onChange={(value) => binding.setValue(section.type, value)}
                    />
                </FFieldControl>
                <FFieldControl width={160} label={color.label} labelFor={color.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={color.id}
                        disabled={!color.getIsEnabled()}
                        invalid={color.getHasError()}
                        value={color.getValue()}
                        onChange={(value) => binding.setValue(section.color, value)}
                    />
                </FFieldControl>
                <div className="w-100">
                    <FFieldControl label={model.label} labelFor={model.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={model.id}
                            disabled={!model.getIsEnabled()}
                            invalid={model.getHasError()}
                            value={model.getValue()}
                            onChange={(value) => binding.setValue(section.model, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <div className="p-2">
                <FFieldCheckbox
                    id={noLicensePlate.id}
                    label={noLicensePlate.label}
                    checked={noLicensePlate.getValue() as boolean}
                    disabled={!noLicensePlate.getIsEnabled()}
                    invalid={noLicensePlate.getHasError()}
                    onChange={(checked) => binding.setValue(section.noLicensePlate, checked)}
                />
            </div>
        </FSection>
    );
}
