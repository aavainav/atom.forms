import React from "react";
import { ISectionBinding, FBorder, FCheckboxField, FFormStackPanel, FLabel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialViolationSectionModel } from "../../models/trial-page/violation-section";

interface ITrialViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialViolationSectionModel>;
}

/** Defines the violation section for the trial page of the S438 citation form. */
export default function TrialViolationSection({ binding }: ITrialViolationSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getSectionNumber()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.sectionNumber, value)} />
                <FTextField field={section.getDescription()} width={244} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.description, value)} />
                <FBorder width={148} borderEdges={["left", "top", "right"]}>
                    <FLabel fontSize="6">Court Appearance Required</FLabel>
                    <FBorder border="hidden" contentJustify="evenly">
                        <FCheckboxField field={section.getCourtAppearanceRequiredYes()} onChange={(checked) => binding.setValue(section.courtAppearanceRequiredYes, checked)} />
                        <FCheckboxField field={section.getCourtAppearanceRequiredNo()} onChange={(checked) => binding.setValue(section.courtAppearanceRequiredNo, checked)} />
                    </FBorder>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getDateOfViolation()} width={118} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfViolation, value)} />
                <FTextField field={section.getTimeOfViolation()} width={100} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.timeOfViolation, value)} />
                <FNumberField field={section.getSpeed()} width={80} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.speed, value)} />
                <FNumberField field={section.getSpeedLimit()} width={80} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.speedLimit, value)} />
                <FNumberField field={section.getScPoints()} width={90} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.scPoints, value)} />
                <FTextField field={section.getBloodAlcoholLevel()} width={120} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bloodAlcoholLevel, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
