import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { TrafficwaySectionModel } from "../../models/collision-page/trafficway-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodedField } from "../fields";

interface ITrafficwaySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrafficwaySectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the trafficway section of the TR-310 - how the trafficway runs and how it is divided. */
export const TrafficwaySection = ({ binding, valueListController }: ITrafficwaySectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadDirectionOptions = useCallback(() => tr310Service.getTrafficwayDirectionOptions(), [tr310Service]);
    const loadDivisionOptions = useCallback(() => tr310Service.getTrafficwayDivisionOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    cacheKey={TR310ValueListId.trafficwayDirection}
                    columns={1}
                    controller={valueListController}
                    field={section.getDirection()}
                    load={loadDirectionOptions}
                    title="Trafficway Direction"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.direction, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.trafficwayDivision}
                    controller={valueListController}
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
