import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { DriverActionsSectionModel } from "../../models/person-page/driver-actions-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IDriverActionsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DriverActionsSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the driver distraction and actions section of the TR-310; the four action boxes share one printed legend. */
export const DriverActionsSection = ({ binding, valueListController }: IDriverActionsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadDistractionOptions = useCallback(() => tr310Service.getDriverDistractionOptions(), [tr310Service]);
    const loadActionOptions = useCallback(() => tr310Service.getDriverActionOptions(), [tr310Service]);

    const actionOptions = useOptions(valueListController, TR310ValueListId.driverAction, loadActionOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    cacheKey={TR310ValueListId.driverDistraction}
                    columns={1}
                    controller={valueListController}
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
                            cacheKey={TR310ValueListId.driverAction}
                            controller={valueListController}
                            field={section.getFirst()}
                            label="1st"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.first, value)}
                        />
                        <CodeBox
                            cacheKey={TR310ValueListId.driverAction}
                            controller={valueListController}
                            field={section.getSecond()}
                            label="2nd"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.second, value)}
                        />
                        <CodeBox
                            cacheKey={TR310ValueListId.driverAction}
                            controller={valueListController}
                            field={section.getThird()}
                            label="3rd"
                            load={loadActionOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.third, value)}
                        />
                        <CodeBox
                            cacheKey={TR310ValueListId.driverAction}
                            controller={valueListController}
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
