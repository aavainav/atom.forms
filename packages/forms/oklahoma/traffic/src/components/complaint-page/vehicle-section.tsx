import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection, setOptionWithDependents } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { VehicleSectionModel } from "../../models/complaint-page/vehicle-section";
import { IOKTrafficService } from "../../services";
import { NumberBox, SelectBox, TextBox, YesNoBox } from "../fields";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the vehicle section of the Oklahoma City traffic citation form's complaint page. */
export const VehicleSection = ({ binding, valueListController }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const year = section.getYear();
    const make = section.getMake();
    const model = section.getModel();
    const style = section.getStyle();
    const color = section.getColor();
    const vin = section.getVin();
    const tag = section.getTag();
    const tagState = section.getTagState();
    const registrationExpires = section.getRegistrationExpires();
    const commercialVehicle = section.getCommercialVehicle();
    const hazardousMaterials = section.getHazardousMaterials();

    const loadMakeOptions = useCallback(() => okTrafficService.getVehicleMakeOptions(), [okTrafficService]);
    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);
    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    // The model list is the one value list on this form that hangs off another field, and the whole of that
    // dependency is the `parentValue` handed to the model box below: the chosen make's code reaches the loader as
    // its argument and goes into the box's cache key, so the loader is not rebuilt when the make changes and no
    // field has to carry any notion of another field.
    const makeCode = make.getValue().value;
    const loadModelOptions = useCallback(
        (parentValue?: string) => okTrafficService.getVehicleModelOptions(parentValue ?? ""),
        [okTrafficService]);

    // changing the make clears the model in the same update, so the citation is never momentarily holding a model
    // belonging to a make it no longer has
    const setMake = setOptionWithDependents(binding, section.make, [section.model]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">VEHICLE INFORMATION</div>
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
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.model, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={style} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.style, value)} />
                <TextBox field={color} width={160} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.color, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={vin} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.vin, value)} /></div>
                <TextBox field={tag} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.tag, value)} />
                <SelectBox
                    cacheKey={ValueListId.state}
                    controller={valueListController}
                    field={tagState}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.tagState, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={registrationExpires} type="date" width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.registrationExpires, value)} />
                <YesNoBox controller={valueListController} field={commercialVehicle} load={loadYesNoOptions} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.commercialVehicle, value)} />
                <YesNoBox controller={valueListController} field={hazardousMaterials} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.hazardousMaterials, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
