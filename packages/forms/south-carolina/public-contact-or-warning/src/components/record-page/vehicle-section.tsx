import React, { useCallback } from "react";
import { useService } from "@common/react";
import { setOptionWithDependents, ISectionBinding, FBorder, FCheckboxField, FFormStackPanel, FNumberField, FSection, FSelectField, FTextField } from "@forms/core";

import { VehicleSectionModel } from "../../models/record-page/vehicle-section";
import { IPublicContactOrWarningService } from "../../services";

interface IVehicleSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<VehicleSectionModel>;
}

/** Defines the vehicle section of the public contact/warning record. */
export const VehicleSection = ({ binding }: IVehicleSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);
    const model = section.getModel();

    const loadStateOptions = useCallback(() => publicContactOrWarningService.getStateOptions(), [publicContactOrWarningService]);
    const loadMakeOptions = useCallback(() => publicContactOrWarningService.getVehicleMakeOptions(), [publicContactOrWarningService]);

    // The model list is the one value list on this record that hangs off another field, and the whole of that
    // dependency is the `parentValue` handed to the model select below: the chosen make's code reaches the loader
    // as its argument and goes into the select's cache key, so the loader is not rebuilt when the make changes
    // and no field has to carry any notion of another field.
    const makeCode = section.getMake().getValue().value;
    const loadModelOptions = useCallback(
        (parentValue?: string) => publicContactOrWarningService.getVehicleModelOptions(parentValue ?? ""),
        [publicContactOrWarningService]);

    // changing the make clears the model in the same update, so the record is never momentarily holding a model
    // belonging to a make it no longer has
    const setMake = setOptionWithDependents(binding, section.make, [section.model]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FTextField field={section.getLicenseNumber()} borderEdges={["top"]} width={173} onChange={(value) => binding.setValue(section.licenseNumber, value)} />
                <FSelectField
                    field={section.getState()}
                    load={loadStateOptions}
                    borderEdges={["left", "top"]}
                    format="valueOnly"
                    width={85}
                    onChange={(value) => binding.setValue(section.state, value)}
                />
                <FSelectField field={section.getMake()} load={loadMakeOptions} borderEdges={["left", "top"]} format="valueOnly" width={150} onChange={setMake} />
                <FNumberField field={section.getYear()} borderEdges={["left", "top"]} width={65} onChange={(value) => binding.setValue(section.year, value)} />
                <FBorder borderEdges={["left", "top"]} contentJustify="center" height={44} width={115}>
                    <FCheckboxField field={section.getCmv()} onChange={(checked) => binding.setValue(section.cmv, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal" height={44}>
                <FSelectField
                    field={model}
                    load={loadModelOptions}
                    borderEdges={["top"]}
                    // a model only means anything underneath a make, so the field stays shut until one is
                    // chosen - which also keeps the model list from being fetched at all until then
                    disabled={!makeCode}
                    parentValue={makeCode}
                    placeholder={makeCode ? "Select..." : "Select a make first"}
                    showPlaceholderWhenDisabled={model.getIsEnabled()}
                    width={588}
                    onChange={(value) => binding.setValue(section.model, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
