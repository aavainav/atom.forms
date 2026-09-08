import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldSelect, FFormStackPanel, FSection, setOptionWithDependents } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { VehicleSectionModel } from "../../models/unit-page/vehicle-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, TextField } from "../fields";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the vehicle section of the TR-310 unit page - the plate, the VIN, and how badly the vehicle was damaged. */
export const VehicleSection = ({ binding, valueListController }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const state = section.getState();
    const make = section.getMake();
    const model = section.getModel();

    const loadStatusOptions = useCallback(() => tr310Service.getUnitStatusOptions(), [tr310Service]);
    const loadDamageExtentOptions = useCallback(() => tr310Service.getDamageExtentOptions(), [tr310Service]);
    const loadHitAndRunOptions = useCallback(() => tr310Service.getYesNoOptions(), [tr310Service]);
    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);
    const loadMakeOptions = useCallback(() => tr310Service.getVehicleMakeOptions(), [tr310Service]);

    // The model list is the one value list on this report that hangs off another field, and the whole of that
    // dependency is the `parentValue` handed to the model select below: the chosen make's code reaches the loader
    // as its argument and goes into the select's cache key, so the loader is not rebuilt when the make changes and
    // no field has to carry any notion of another field.
    const makeCode = make.getValue().value;
    const loadModelOptions = useCallback(
        (parentValue?: string) => tr310Service.getVehicleModelOptions(parentValue ?? ""),
        [tr310Service]);

    // changing the make clears the model in the same update, so the unit is never momentarily holding a model
    // belonging to a make it no longer has
    const setMake = setOptionWithDependents(binding, section.make, [section.model]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <CodeBox
                    cacheKey={TR310ValueListId.unitStatus}
                    controller={valueListController}
                    field={section.getStatus()}
                    label={section.getStatus().label}
                    load={loadStatusOptions}
                    width={120}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.status, value)}
                />
                <TextField field={section.getPlateNumber()} width={170} maxlength={20} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.plateNumber, value)} />
                <FFieldControl width={80} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
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
                <TextField field={section.getPlateExpires()} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.plateExpires, value)} />
                <TextField field={section.getIdentificationNumber()} width={230} maxlength={17} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.identificationNumber, value)} />
                <CodeBox
                    cacheKey={TR310ValueListId.damageExtent}
                    controller={valueListController}
                    field={section.getDamageExtent()}
                    label={section.getDamageExtent().label}
                    load={loadDamageExtentOptions}
                    width={150}
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.damageExtent, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <CodeBox
                    cacheKey={TR310ValueListId.yesNo}
                    controller={valueListController}
                    field={section.getHitAndRun()}
                    label={section.getHitAndRun().label}
                    load={loadHitAndRunOptions}
                    width={100}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.hitAndRun, value)}
                />
                <TextField field={section.getYear()} width={80} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.year, Number(value))} />
                <FFieldControl width={170} label={make.label} labelFor={make.id} borderEdges={["top", "left"]}>
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
                <FFieldControl width={220} label={model.label} labelFor={model.id} borderEdges={["top", "left"]}>
                    <FFieldSelect
                        id={model.id}
                        cacheKey={ValueListId.vehicleModel}
                        parentValue={makeCode}
                        controller={valueListController}
                        // a model only means anything underneath a make, so the field stays shut until one is
                        // chosen - which also keeps the model list from being fetched at all until then
                        disabled={!makeCode || !model.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={model.getHasError()}
                        options={loadModelOptions}
                        placeholder={makeCode ? "Select..." : "Select a make first"}
                        searchable
                        value={model.getValue()}
                        onChange={(value) => binding.setValue(section.model, value as IOptionValue)}
                    />
                </FFieldControl>
                <TextField field={section.getBodyType()} width={120} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.bodyType, value)} />
                <TextField field={section.getOccupantCount()} width={110} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.occupantCount, Number(value))} />
            </FFormStackPanel>
        </FSection>
    );
};
