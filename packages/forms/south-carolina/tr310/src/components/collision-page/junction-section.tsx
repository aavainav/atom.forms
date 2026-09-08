import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { JunctionSectionModel } from "../../models/collision-page/junction-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IJunctionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<JunctionSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the junction section of the TR-310 - the collision's relation to a junction, the contributing roadway factors, and whether a school bus was involved. */
export const JunctionSection = ({ binding, valueListController }: IJunctionSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadRelationOptions = useCallback(() => tr310Service.getRelationToJunctionOptions(), [tr310Service]);
    const loadFactorOptions = useCallback(() => tr310Service.getRoadwayContributingFactorOptions(), [tr310Service]);
    const loadSchoolBusOptions = useCallback(() => tr310Service.getSchoolBusRelationOptions(), [tr310Service]);

    // the form records up to two contributing factors against a single printed legend
    const factorOptions = useOptions(valueListController, TR310ValueListId.roadwayContributingFactor, loadFactorOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    cacheKey={TR310ValueListId.relationToJunction}
                    controller={valueListController}
                    field={section.getRelation()}
                    load={loadRelationOptions}
                    title="Relation to Junction"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.relation, value)}
                />
                <CodedField
                    cacheKey={TR310ValueListId.schoolBusRelation}
                    columns={1}
                    controller={valueListController}
                    field={section.getSchoolBusRelated()}
                    load={loadSchoolBusOptions}
                    title="School Bus Related"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.schoolBusRelated, value)}
                />
            </FFormStackPanel>
            {/* twenty-five codes across three columns need the full width, so this sits on a row of its own */}
            <FBorder borderEdges={["top", "left", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Contributing Factor - Roadway/Environment 1 &amp; 2 (up to 2)</span></FLabel>
                <FFormStackPanel direction="horizontal">
                    <CodeBox
                        cacheKey={TR310ValueListId.roadwayContributingFactor}
                        controller={valueListController}
                        field={section.getContributingFactorFirst()}
                        load={loadFactorOptions}
                        borderEdges={["top", "right"]}
                        onChange={(value) => binding.setValue(section.contributingFactorFirst, value)}
                    />
                    <CodeBox
                        cacheKey={TR310ValueListId.roadwayContributingFactor}
                        controller={valueListController}
                        field={section.getContributingFactorSecond()}
                        load={loadFactorOptions}
                        borderEdges={["top", "right"]}
                        onChange={(value) => binding.setValue(section.contributingFactorSecond, value)}
                    />
                    <CodeLegend options={factorOptions} columns={3} />
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
};
