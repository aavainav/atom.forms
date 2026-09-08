import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FSection } from "@forms/core";

import { UnitTypeSectionModel } from "../../models/unit-page/unit-type-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodedField } from "../fields";

interface IUnitTypeSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<UnitTypeSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the unit type section of the TR-310 - what kind of unit it was, its emergency use, and its special function. */
export const UnitTypeSection = ({ binding, valueListController }: IUnitTypeSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadUnitTypeOptions = useCallback(() => tr310Service.getUnitTypeOptions(), [tr310Service]);
    const loadEmergencyOptions = useCallback(() => tr310Service.getEmergencyVehicleUseOptions(), [tr310Service]);
    const loadSpecialFunctionOptions = useCallback(() => tr310Service.getSpecialFunctionOptions(), [tr310Service]);

    return (
        <FSection>
            {/* the unit type and special function lists are long enough to want the full width of the page */}
            <CodedField
                cacheKey={TR310ValueListId.unitType}
                columns={3}
                controller={valueListController}
                field={section.getUnit()}
                load={loadUnitTypeOptions}
                title="Unit Type"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.unit, value)}
            />
            <CodedField
                cacheKey={TR310ValueListId.emergencyVehicleUse}
                columns={2}
                controller={valueListController}
                field={section.getEmergencyVehicleUse()}
                load={loadEmergencyOptions}
                title="Emergency Vehicle Use"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.emergencyVehicleUse, value)}
            />
            <CodedField
                cacheKey={TR310ValueListId.specialFunction}
                columns={3}
                controller={valueListController}
                field={section.getSpecialFunction()}
                load={loadSpecialFunctionOptions}
                title="Special Function of Motor Vehicle"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.specialFunction, value)}
            />
        </FSection>
    );
};
