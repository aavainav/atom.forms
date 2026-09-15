import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { TrafficwaySectionModel } from "../../models/collision-page/trafficway-section";
import { ITR310Service } from "../../services";
import { CodedField } from "../fields";

interface ITrafficwaySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrafficwaySectionModel>;
}

/** Defines the trafficway section of the TR-310 - how the trafficway runs and how it is divided. */
export const TrafficwaySection = ({ binding }: ITrafficwaySectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadDirectionOptions = useCallback(() => tr310Service.getTrafficwayDirectionOptions(), [tr310Service]);
    const loadDivisionOptions = useCallback(() => tr310Service.getTrafficwayDivisionOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    columns={1}
                    field={section.getDirection()}
                    load={loadDirectionOptions}
                    title="Trafficway Direction"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.direction, value)}
                />
                <CodedField
                    field={section.getDivided()}
                    load={loadDivisionOptions}
                    title="Trafficway Divided"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.divided, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
