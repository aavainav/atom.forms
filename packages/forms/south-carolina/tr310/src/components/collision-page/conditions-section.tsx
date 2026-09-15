import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { ConditionsSectionModel } from "../../models/collision-page/conditions-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IConditionsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ConditionsSectionModel>;
}

/** Defines the conditions section of the TR-310 - light, weather, road surface, and the manner in which the units came together. */
export const ConditionsSection = ({ binding }: IConditionsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadLightOptions = useCallback(() => tr310Service.getLightConditionOptions(), [tr310Service]);
    const loadWeatherOptions = useCallback(() => tr310Service.getWeatherConditionOptions(), [tr310Service]);
    const loadRoadSurfaceOptions = useCallback(() => tr310Service.getRoadSurfaceConditionOptions(), [tr310Service]);
    const loadMannerOptions = useCallback(() => tr310Service.getMannerOfCollisionOptions(), [tr310Service]);

    // the form records up to two weather conditions against a single printed legend, so the two boxes sit side by
    // side above the one list rather than each repeating it
    const weatherOptions = useOptions(loadWeatherOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    field={section.getLight()}
                    load={loadLightOptions}
                    title="Light Condition"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.light, value)}
                />
                <FBorder borderEdges={["top", "left"]}>
                    <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Weather Condition 1 &amp; 2 (up to 2)</span></FLabel>
                    <FFormStackPanel direction="horizontal">
                        <CodeBox
                            field={section.getWeatherFirst()}
                            load={loadWeatherOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.weatherFirst, value)}
                        />
                        <CodeBox
                            field={section.getWeatherSecond()}
                            load={loadWeatherOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.weatherSecond, value)}
                        />
                        <CodeLegend options={weatherOptions} />
                    </FFormStackPanel>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    field={section.getRoadSurface()}
                    load={loadRoadSurfaceOptions}
                    title="Road Surface Condition"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.roadSurface, value)}
                />
                <CodedField
                    field={section.getMannerOfCollision()}
                    load={loadMannerOptions}
                    title="Manner of Collision"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.mannerOfCollision, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
