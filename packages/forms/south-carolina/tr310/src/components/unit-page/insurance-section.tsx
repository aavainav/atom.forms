import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { InsuranceSectionModel } from "../../models/unit-page/insurance-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, TextField } from "../fields";

interface IInsuranceSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<InsuranceSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the insurance and towing section of the TR-310 unit page. */
export const InsuranceSection = ({ binding, valueListController }: IInsuranceSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadCdlOptions = useCallback(() => tr310Service.getCdlRequirementOptions(), [tr310Service]);
    const loadTowOptions = useCallback(() => tr310Service.getTowStatusOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getCompany()} width={280} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.company, value)} />
                <CodeBox
                    cacheKey={TR310ValueListId.cdlRequirement}
                    controller={valueListController}
                    field={section.getCdlRequired()}
                    label={section.getCdlRequired().label}
                    load={loadCdlOptions}
                    width={120}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.cdlRequired, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.towStatus}
                    controller={valueListController}
                    field={section.getTowed()}
                    label={section.getTowed().label}
                    load={loadTowOptions}
                    width={100}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.towed, value)}
                />
                <TextField field={section.getTowedBy()} width={240} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.towedBy, value)} />
                <TextField field={section.getEstimatedDamage()} width={120} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.estimatedDamage, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
