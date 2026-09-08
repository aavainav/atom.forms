import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { AlcoholDrugsSectionModel } from "../../models/person-page/alcohol-drugs-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, TextField } from "../fields";

interface IAlcoholDrugsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<AlcoholDrugsSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the alcohol and drugs section of the TR-310 - what the officer suspected and what the tests found. */
export const AlcoholDrugsSection = ({ binding, valueListController }: IAlcoholDrugsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadSuspectedOptions = useCallback(() => tr310Service.getSuspectedSubstanceUseOptions(), [tr310Service]);
    const loadTestStatusOptions = useCallback(() => tr310Service.getTestStatusOptions(), [tr310Service]);
    const loadAlcoholTypeOptions = useCallback(() => tr310Service.getAlcoholTestTypeOptions(), [tr310Service]);
    const loadDrugTypeOptions = useCallback(() => tr310Service.getDrugTestTypeOptions(), [tr310Service]);
    const loadDrugResultOptions = useCallback(() => tr310Service.getDrugTestResultOptions(), [tr310Service]);

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">ALCOHOL / DRUGS</span></FLabel>
            <FFormStackPanel height={44} direction="horizontal">
                <CodeBox
                    cacheKey={TR310ValueListId.suspectedSubstanceUse}
                    controller={valueListController}
                    field={section.getSuspectedUse()}
                    label={section.getSuspectedUse().label}
                    load={loadSuspectedOptions}
                    width={130}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.suspectedUse, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.testStatus}
                    controller={valueListController}
                    field={section.getAlcoholTestStatus()}
                    label={section.getAlcoholTestStatus().label}
                    load={loadTestStatusOptions}
                    width={140}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.alcoholTestStatus, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.alcoholTestType}
                    controller={valueListController}
                    field={section.getAlcoholTestType()}
                    label={section.getAlcoholTestType().label}
                    load={loadAlcoholTypeOptions}
                    width={130}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.alcoholTestType, value)}
                />
                <TextField field={section.getBloodAlcoholContent()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.bloodAlcoholContent, value)} />
                <CodeBox
                    cacheKey={TR310ValueListId.testStatus}
                    controller={valueListController}
                    field={section.getDrugTestStatus()}
                    label={section.getDrugTestStatus().label}
                    load={loadTestStatusOptions}
                    width={130}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.drugTestStatus, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.drugTestType}
                    controller={valueListController}
                    field={section.getDrugTestType()}
                    label={section.getDrugTestType().label}
                    load={loadDrugTypeOptions}
                    width={120}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.drugTestType, value)}
                />
                <CodeBox
                    cacheKey={TR310ValueListId.drugTestResult}
                    controller={valueListController}
                    field={section.getDrugTestResult()}
                    label={section.getDrugTestResult().label}
                    load={loadDrugResultOptions}
                    width={130}
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.drugTestResult, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
