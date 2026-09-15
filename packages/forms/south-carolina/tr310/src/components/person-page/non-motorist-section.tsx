import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { NonMotoristSectionModel } from "../../models/person-page/non-motorist-section";
import { ITR310Service } from "../../services";
import { CodedField } from "../fields";

interface INonMotoristSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NonMotoristSectionModel>;
}

/** Defines the non-motorist section of the TR-310, which stands in for the driver fields when the page records one. */
export const NonMotoristSection = ({ binding }: INonMotoristSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadUnitTypeOptions = useCallback(() => tr310Service.getNonMotoristUnitTypeOptions(), [tr310Service]);
    const loadDistractionOptions = useCallback(() => tr310Service.getNonMotoristDistractionOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    field={section.getUnitType()}
                    load={loadUnitTypeOptions}
                    title="Non-Motorist Unit Type"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.unitType, value)}
                />
                <CodedField
                    field={section.getDistraction()}
                    load={loadDistractionOptions}
                    title="Non-Motorist Distraction"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.distraction, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
