import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { RoadwaySectionModel } from "../../models/unit-page/roadway-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IRoadwaySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RoadwaySectionModel>;
}

/** Defines the roadway section of the TR-310 unit page - the grade and alignment, what the vehicle was doing, the traffic control devices, and the vehicle's own contributing circumstances. */
export const RoadwaySection = ({ binding }: IRoadwaySectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadGradeOptions = useCallback(() => tr310Service.getRoadwayGradeOptions(), [tr310Service]);
    const loadAlignmentOptions = useCallback(() => tr310Service.getRoadwayAlignmentOptions(), [tr310Service]);
    const loadActionOptions = useCallback(() => tr310Service.getVehicleActionPriorToImpactOptions(), [tr310Service]);
    const loadDeviceOptions = useCallback(() => tr310Service.getTrafficControlDeviceOptions(), [tr310Service]);
    const loadCircumstanceOptions = useCallback(() => tr310Service.getVehicleContributingCircumstanceOptions(), [tr310Service]);

    // the form records up to four traffic control devices against a single printed legend
    const deviceOptions = useOptions(loadDeviceOptions);

    const devices = [
        { field: section.getTrafficControlDeviceFirst(), definition: section.trafficControlDeviceFirst, label: "1st" },
        { field: section.getTrafficControlDeviceSecond(), definition: section.trafficControlDeviceSecond, label: "2nd" },
        { field: section.getTrafficControlDeviceThird(), definition: section.trafficControlDeviceThird, label: "3rd" },
        { field: section.getTrafficControlDeviceFourth(), definition: section.trafficControlDeviceFourth, label: "4th" }
    ];

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    columns={1}
                    field={section.getGrade()}
                    load={loadGradeOptions}
                    title="Roadway Grade"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.grade, value)}
                />
                <CodedField
                    columns={1}
                    field={section.getAlignment()}
                    load={loadAlignmentOptions}
                    title="Alignment"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.alignment, value)}
                />
                <CodedField
                    field={section.getVehicleActionPriorToImpact()}
                    load={loadActionOptions}
                    title="Vehicle Action Prior to Impact"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.vehicleActionPriorToImpact, value)}
                />
            </FFormStackPanel>
            <FBorder borderEdges={["top", "left", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Traffic Control Device (up to 4)</span></FLabel>
                <FFormStackPanel height={44} direction="horizontal">
                    {devices.map(({ field, definition, label }) => (
                        <CodeBox
                            key={field.id}
                            field={field}
                            label={label}
                            load={loadDeviceOptions}
                            borderEdges={["top", "left"]}
                            onChange={(value) => binding.setValue(definition, value)}
                        />
                    ))}
                </FFormStackPanel>
                <CodeLegend options={deviceOptions} columns={3} />
            </FBorder>
            <CodedField
                columns={3}
                field={section.getVehicleContributingCircumstances()}
                load={loadCircumstanceOptions}
                title="Vehicle Contributing Circumstances"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.vehicleContributingCircumstances, value)}
            />
        </FSection>
    );
};
