import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { VehicleSectionModel } from "../../models/citation-page/vehicle-section";
import { IOKParkingService } from "../../services";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the vehicle section of the Oklahoma City parking violation form's citation page. */
export const VehicleSection = ({ binding, valueListController }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okParkingService = useService<IOKParkingService>(IOKParkingService);

    const licenseNumber = section.getLicenseNumber();
    const make = section.getMake();
    const meterNumber = section.getMeterNumber();

    const loadMakeOptions = useCallback(() => okParkingService.getVehicleMakeOptions(), [okParkingService]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">Vehicle License Number</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={licenseNumber.label} labelFor={licenseNumber.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={licenseNumber.id}
                            disabled={!licenseNumber.getIsEnabled()}
                            invalid={licenseNumber.getHasError()}
                            value={licenseNumber.getValue()}
                            onChange={(value) => binding.setValue(section.licenseNumber, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={220} label={make.label} labelFor={make.id} borderEdges={["left", "top"]}>
                    <FFieldSelect
                        id={make.id}
                        cacheKey={ValueListId.vehicleMake}
                        controller={valueListController}
                        disabled={!make.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={make.getHasError()}
                        options={loadMakeOptions}
                        searchable
                        value={make.getValue()}
                        onChange={(value) => binding.setValue(section.make, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl width={160} label={meterNumber.label} labelFor={meterNumber.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={meterNumber.id}
                        disabled={!meterNumber.getIsEnabled()}
                        invalid={meterNumber.getHasError()}
                        value={meterNumber.getValue()}
                        onChange={(value) => binding.setValue(section.meterNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
