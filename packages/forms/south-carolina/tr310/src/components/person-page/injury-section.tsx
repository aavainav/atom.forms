import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { InjurySectionModel } from "../../models/person-page/injury-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IInjurySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<InjurySectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the injury section of the TR-310 - how badly the person was hurt, what they contributed, and what they were doing before the impact. */
export const InjurySection = ({ binding, valueListController }: IInjurySectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadInjuryOptions = useCallback(() => tr310Service.getInjuryStatusOptions(), [tr310Service]);
    const loadContributingOptions = useCallback(() => tr310Service.getContributingActionOptions(), [tr310Service]);
    const loadActionOptions = useCallback(() => tr310Service.getActionPriorToImpactOptions(), [tr310Service]);

    // the form records up to two contributing actions against a single printed legend
    const contributingOptions = useOptions(valueListController, TR310ValueListId.contributingAction, loadContributingOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    cacheKey={TR310ValueListId.injuryStatus}
                    columns={1}
                    controller={valueListController}
                    field={section.getStatus()}
                    load={loadInjuryOptions}
                    title="Injury Status"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.status, value)}
                />
                <FBorder borderEdges={["top", "left"]}>
                    <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">Contributing Actions / Circumstances</span></FLabel>
                    <FFormStackPanel direction="horizontal">
                        <CodeBox
                            cacheKey={TR310ValueListId.contributingAction}
                            controller={valueListController}
                            field={section.getContributingActionFirst()}
                            label="1st"
                            load={loadContributingOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.contributingActionFirst, value)}
                        />
                        <CodeBox
                            cacheKey={TR310ValueListId.contributingAction}
                            controller={valueListController}
                            field={section.getContributingActionSecond()}
                            label="2nd"
                            load={loadContributingOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.contributingActionSecond, value)}
                        />
                        <CodeLegend options={contributingOptions} />
                    </FFormStackPanel>
                </FBorder>
                <CodedField
                    cacheKey={TR310ValueListId.actionPriorToImpact}
                    controller={valueListController}
                    field={section.getActionPriorToImpact()}
                    load={loadActionOptions}
                    title="Action Prior to Impact"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.actionPriorToImpact, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
