import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { BarrierSectionModel } from "../../models/collision-page/barrier-section";
import { ITR310Service } from "../../services";
import { CodedField } from "../fields";

interface IBarrierSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<BarrierSectionModel>;
}

/** Defines the barrier and intersection type section of the TR-310. */
export const BarrierSection = ({ binding }: IBarrierSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadBarrierOptions = useCallback(() => tr310Service.getBarrierTypeOptions(), [tr310Service]);
    const loadIntersectionOptions = useCallback(() => tr310Service.getIntersectionTypeOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    field={section.getType()}
                    load={loadBarrierOptions}
                    title="Barrier Type"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.type, value)}
                />
                <CodedField
                    field={section.getIntersectionType()}
                    load={loadIntersectionOptions}
                    title="Type of Intersection"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.intersectionType, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
