import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { TravelSectionModel } from "../../models/unit-page/travel-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, TextField } from "../fields";

interface ITravelSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TravelSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the travel section of the TR-310 unit page - which way the unit was going and how speed was involved. */
export const TravelSection = ({ binding, valueListController }: ITravelSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadDirectionOptions = useCallback(() => tr310Service.getTravelDirectionOptions(), [tr310Service]);
    const loadSpeedOptions = useCallback(() => tr310Service.getSpeedRelationOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <CodeBox
                    cacheKey={TR310ValueListId.travelDirection}
                    controller={valueListController}
                    field={section.getDirection()}
                    label={section.getDirection().label}
                    load={loadDirectionOptions}
                    width={140}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.direction, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.speedRelation}
                    controller={valueListController}
                    field={section.getSpeedRelated()}
                    label={section.getSpeedRelated().label}
                    load={loadSpeedOptions}
                    width={140}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.speedRelated, value)}
                />
                <TextField field={section.getEstimatedSpeed()} width={110} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.estimatedSpeed, value)} />
                <TextField field={section.getSpeedLimit()} width={110} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.speedLimit, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
