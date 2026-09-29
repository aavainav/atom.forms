import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialViolationSectionModel } from "../../models/trial-page/violation-section";
import CheckboxField from "./checkbox-field";

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
                <div className="w-100">
                    <FTextField field={section.getSectionNumber()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.sectionNumber, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getDescription()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.description, value)} />
                </div>
                <FBorder borderEdges={["left", "top", "right"]}>
                    <FLabel fontSize="6">Court Appearance Required</FLabel>
                    <FBorder border="hidden" contentJustify="evenly">
                        <CheckboxField field={section.getCourtAppearanceRequiredYes()} onChange={(checked) => binding.setValue(section.courtAppearanceRequiredYes, checked)} />
                        <CheckboxField field={section.getCourtAppearanceRequiredNo()} onChange={(checked) => binding.setValue(section.courtAppearanceRequiredNo, checked)} />
                    </FBorder>
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getDateOfViolation()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfViolation, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getTimeOfViolation()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.timeOfViolation, value)} />
                </div>
                <div className="w-100">
                    <FNumberField field={section.getScPoints()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.scPoints, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getBloodAlcoholLevel()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bloodAlcoholLevel, value)} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
