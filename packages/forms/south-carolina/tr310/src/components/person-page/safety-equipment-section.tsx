import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { SafetyEquipmentSectionModel } from "../../models/person-page/safety-equipment-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, useOptions } from "../fields";

interface ISafetyEquipmentSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<SafetyEquipmentSectionModel>;
}

/** Defines the safety equipment section of the TR-310; every box takes the same yes/no/unknown/not-applicable answer, so one legend serves all six. */
export const SafetyEquipmentSection = ({ binding }: ISafetyEquipmentSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const load = useCallback(() => tr310Service.getSafetyEquipmentUseOptions(), [tr310Service]);
    const options = useOptions(load);

    const boxes = [
        { field: section.getHelmetUse(), definition: section.helmetUse },
        { field: section.getProtectivePadsUse(), definition: section.protectivePadsUse },
        { field: section.getOtherProtectiveUse(), definition: section.otherProtectiveUse },
        { field: section.getReflectiveClothingUse(), definition: section.reflectiveClothingUse },
        { field: section.getLightingUse(), definition: section.lightingUse },
        { field: section.getOtherPreventativeUse(), definition: section.otherPreventativeUse }
    ];

    return (
        <FSection>
            <FBorder borderEdges={["top", "left", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Safety Equipment-SE</span></FLabel>
                <FFormStackPanel direction="horizontal">
                    <CodeLegend options={options} columns={4} />
                </FFormStackPanel>
                {/* six boxes with labels this long do not fit across a 1024px page, so they run three to a row */}
                {[boxes.slice(0, 3), boxes.slice(3)].map((row, index) => (
                    <FFormStackPanel key={index} height={44} direction="horizontal">
                        {row.map(({ field, definition }) => (
                            <CodeBox
                                key={field.id}
                                field={field}
                                label={field.label}
                                load={load}
                                width={320}
                                borderEdges={["top", "left"]}
                                onChange={(value) => binding.setValue(definition, value)}
                            />
                        ))}
                    </FFormStackPanel>
                ))}
            </FBorder>
        </FSection>
    );
};
