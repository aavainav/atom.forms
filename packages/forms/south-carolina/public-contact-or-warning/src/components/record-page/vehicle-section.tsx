import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FBorder, FFieldCheckbox, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection, setOptionWithDependents } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { VehicleSectionModel } from "../../models/record-page/vehicle-section";
import { IPublicContactOrWarningService } from "../../services";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the vehicle section of the public contact/warning record. */
export const VehicleSection = ({ binding, valueListController }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const licenseNumber = section.getLicenseNumber();
    const state = section.getState();
    const make = section.getMake();
    const model = section.getModel();
    const year = section.getYear();
    const cmv = section.getCmv();

    const loadStateOptions = useCallback(() => publicContactOrWarningService.getStateOptions(), [publicContactOrWarningService]);
    const loadMakeOptions = useCallback(() => publicContactOrWarningService.getVehicleMakeOptions(), [publicContactOrWarningService]);

    // The model list is the one value list on this record that hangs off another field, and the whole of that
    // dependency is the `parentValue` handed to the model select below: the chosen make's code reaches the loader
    // as its argument and goes into the select's cache key, so the loader is not rebuilt when the make changes
    // and no field has to carry any notion of another field.
    const makeCode = make.getValue().value;
    const loadModelOptions = useCallback(
        (parentValue?: string) => publicContactOrWarningService.getVehicleModelOptions(parentValue ?? ""),
        [publicContactOrWarningService]);

    // changing the make clears the model in the same update, so the record is never momentarily holding a model
    // belonging to a make it no longer has
    const setMake = setOptionWithDependents(binding, section.make, [section.model]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={licenseNumber.label} labelFor={licenseNumber.id} width={173}>
                    <FFieldInput
                        id={licenseNumber.id}
                        disabled={!licenseNumber.getIsEnabled()}
                        invalid={licenseNumber.getHasError()}
                        value={licenseNumber.getValue()}
                        onChange={(value) => binding.setValue(section.licenseNumber, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={state.label} labelFor={state.id} width={85}>
                    <FFieldSelect
                        id={state.id}
                        cacheKey={ValueListId.state}
                        controller={valueListController}
                        disabled={!state.getIsEnabled()}
                        format="valueOnly"
                        invalid={state.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={state.getValue()}
                        onChange={(value) => binding.setValue(section.state, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={make.label} labelFor={make.id} width={150}>
                    <FFieldSelect
                        id={make.id}
                        cacheKey={ValueListId.vehicleMake}
                        controller={valueListController}
                        disabled={!make.getIsEnabled()}
                        format="valueOnly"
                        invalid={make.getHasError()}
                        options={loadMakeOptions}
                        searchable
                        value={make.getValue()}
                        onChange={(value) => setMake(value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={year.label} labelFor={year.id} width={65}>
                    <FFieldInput
                        id={year.id}
                        disabled={!year.getIsEnabled()}
                        invalid={year.getHasError()}
                        value={year.getValue()}
                        onChange={(value) => binding.setValue(section.year, Number(value))}
                    />
                </FFieldControl>
                <FBorder borderEdges={["left", "top"]} contentJustify="center" height={44} width={115}>
                    <FFieldCheckbox
                        id={cmv.id}
                        checked={cmv.getValue() as boolean}
                        disabled={!cmv.getIsEnabled()}
                        invalid={cmv.getHasError()}
                        label={cmv.label}
                        onChange={(checked) => binding.setValue(section.cmv, checked)}
                    />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={model.label} labelFor={model.id} width={588}>
                    <FFieldSelect
                        id={model.id}
                        cacheKey={ValueListId.vehicleModel}
                        controller={valueListController}
                        // a model only means anything underneath a make, so the field stays shut until one is
                        // chosen - which also keeps the model list from being fetched at all until then
                        disabled={!makeCode || !model.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={model.getHasError()}
                        options={loadModelOptions}
                        parentValue={makeCode}
                        placeholder={makeCode ? "Select..." : "Select a make first"}
                        searchable
                        value={model.getValue()}
                        onChange={(value) => binding.setValue(section.model, value as IOptionValue)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
