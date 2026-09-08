import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection, setOptionWithDependents } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { VehicleSectionModel } from "../../models/citation-page/vehicle-section";
import { IGAUTCService } from "../../services";
import { NumberBox, SelectBox, TextBox, twoDigitBoxWidth } from "../fields";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the vehicle boxes of Section I of the Georgia uniform traffic citation. */
export const VehicleSection = ({ binding, valueListController }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const gaUtcService = useService<IGAUTCService>(IGAUTCService);

    const year = section.getYear();
    const make = section.getMake();
    const model = section.getModel();
    const color = section.getColor();
    const registrationNumber = section.getRegistrationNumber();
    const registrationYear = section.getRegistrationYear();
    const registrationState = section.getRegistrationState();

    const loadMakeOptions = useCallback(() => gaUtcService.getVehicleMakeOptions(), [gaUtcService]);
    const loadStateOptions = useCallback(() => gaUtcService.getStateOptions(), [gaUtcService]);

    // The model list is the one value list on this citation that hangs off another field, and the whole of that
    // dependency is the `parentValue` handed to the model box below: the chosen make's code reaches the loader as
    // its argument and goes into the box's cache key, so no field has to carry any notion of another field.
    const makeCode = make.getValue().value;
    const loadModelOptions = useCallback(
        (parentValue?: string) => gaUtcService.getVehicleModelOptions(parentValue ?? ""),
        [gaUtcService]);

    // changing the make clears the model in the same update, so the citation is never momentarily holding a model
    // belonging to a make it no longer has
    const setMake = setOptionWithDependents(binding, section.make, [section.model]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <NumberBox field={year} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.year, value)} />
                <SelectBox
                    cacheKey={ValueListId.vehicleMake}
                    controller={valueListController}
                    field={make}
                    load={loadMakeOptions}
                    width={200}
                    borderEdges={["left", "top"]}
                    onChange={setMake}
                />
                <SelectBox
                    cacheKey={`${ValueListId.vehicleModel}:${makeCode}`}
                    controller={valueListController}
                    field={model}
                    load={loadModelOptions}
                    parentValue={makeCode}
                    width={200}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.model, value)}
                />
                <div className="w-100"><TextBox field={color} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.color, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={registrationNumber} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.registrationNumber, value)} /></div>
                <TextBox field={registrationYear} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.registrationYear, value)} />
                <SelectBox
                    cacheKey={ValueListId.state}
                    controller={valueListController}
                    field={registrationState}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.registrationState, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
