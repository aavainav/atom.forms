import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { InjurySectionModel } from "../../models/person-page/injury-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, CodedField, useOptions } from "../fields";

interface IInjurySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<InjurySectionModel>;
}

/** Defines the injury section of the TR-310 - how badly the person was hurt, what they contributed, and what they were doing before the impact. */
export const InjurySection = ({ binding }: IInjurySectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadInjuryOptions = useCallback(() => tr310Service.getInjuryStatusOptions(), [tr310Service]);
    const loadContributingOptions = useCallback(() => tr310Service.getContributingActionOptions(), [tr310Service]);
    const loadActionOptions = useCallback(() => tr310Service.getActionPriorToImpactOptions(), [tr310Service]);

    // the form records up to two contributing actions against a single printed legend
    const contributingOptions = useOptions(loadContributingOptions);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    columns={1}
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
                            field={section.getContributingActionFirst()}
                            label="1st"
                            load={loadContributingOptions}
                            borderEdges={["top", "right"]}
                            onChange={(value) => binding.setValue(section.contributingActionFirst, value)}
                        />
                        <CodeBox
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
