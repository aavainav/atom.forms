import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FSection } from "@forms/core";

import { UnitTypeSectionModel } from "../../models/unit-page/unit-type-section";
import { ITR310Service } from "../../services";
import { CodedField } from "../fields";

interface IUnitTypeSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<UnitTypeSectionModel>;
}

/** Defines the unit type section of the TR-310 - what kind of unit it was, its emergency use, and its special function. */
export const UnitTypeSection = ({ binding }: IUnitTypeSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadUnitTypeOptions = useCallback(() => tr310Service.getUnitTypeOptions(), [tr310Service]);
    const loadEmergencyOptions = useCallback(() => tr310Service.getEmergencyVehicleUseOptions(), [tr310Service]);
    const loadSpecialFunctionOptions = useCallback(() => tr310Service.getSpecialFunctionOptions(), [tr310Service]);

    return (
        <FSection>
            {/* the unit type and special function lists are long enough to want the full width of the page */}
            <CodedField
                columns={3}
                field={section.getUnit()}
                load={loadUnitTypeOptions}
                title="Unit Type"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.unit, value)}
            />
            <CodedField
                columns={2}
                field={section.getEmergencyVehicleUse()}
                load={loadEmergencyOptions}
                title="Emergency Vehicle Use"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.emergencyVehicleUse, value)}
            />
            <CodedField
                columns={3}
                field={section.getSpecialFunction()}
                load={loadSpecialFunctionOptions}
                title="Special Function of Motor Vehicle"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.specialFunction, value)}
            />
        </FSection>
    );
};
