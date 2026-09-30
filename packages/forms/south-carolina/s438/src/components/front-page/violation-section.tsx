import React from "react";
import { ISectionBinding, FFormStackPanel, FNumberField, FSection, FTextField } from "@forms/core";

import { ViolationSectionModel } from "../../models/front-page/violation-section";

interface IViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationSectionModel>;
}

/** Defines the violation section for the front page of the S438 citation form. */
export default function ViolationSection({ binding }: IViolationSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getSectionNumber()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.sectionNumber, value)} />
                <FTextField field={section.getDescription()} width={392} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.description, value)} />
                {/* courtAppearanceRequiredYes/No are not yet wired to an input */}
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
