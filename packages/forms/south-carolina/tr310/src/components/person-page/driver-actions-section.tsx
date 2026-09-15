import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { DriverActionsSectionModel } from "../../models/person-page/driver-actions-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IDriverActionsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DriverActionsSectionModel>;
}

/** Defines the driver distraction and actions section of the TR-310; the four action boxes share one printed legend. */
export const DriverActionsSection = ({ binding }: IDriverActionsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadDistractionOptions = useCallback(() => tr310Service.getDriverDistractionOptions(), [tr310Service]);
    const loadActionOptions = useCallback(() => tr310Service.getDriverActionOptions(), [tr310Service]);

    const actionOptions = useOptions(loadActionOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    columns={1}
                    field={section.getDistraction()}
                    load={loadDistractionOptions}
                    title="Driver Distraction"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.distraction, value)}
                />
                <FBorder borderEdges={["top", "left", "right"]}>
                    <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Driver Actions at Time of Crash</span></FLabel>
                    <FFormStackPanel direction="horizontal">
                        <CodeBox
                            field={section.getFirst()}
                            label="1st"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.first, value)}
                        />
                        <CodeBox
                            field={section.getSecond()}
                            label="2nd"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.second, value)}
                        />
                        <CodeBox
                            field={section.getThird()}
                            label="3rd"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.third, value)}
                        />
                        <CodeBox
                            field={section.getFourth()}
                            label="4th"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.fourth, value)}
                        />
                        <CodeLegend options={actionOptions} columns={3} />
                    </FFormStackPanel>
                </FBorder>
            </FFormStackPanel>
        </FSection>
    );
};
