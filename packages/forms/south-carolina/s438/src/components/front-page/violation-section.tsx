import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { ViolationSectionModel } from "../../models/front-page/violation-section";

interface IViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationSectionModel>;
}

/** Defines the violation section for the front page of the S438 citation form. */
export default function ViolationSection({ binding }: IViolationSectionProps): React.JSX.Element {
    const section = binding.get();
    const sectionNumber = section.getSectionNumber();
    const description = section.getDescription();
    const dateOfViolation = section.getDateOfViolation();
    const timeOfViolation = section.getTimeOfViolation();
    const scPoints = section.getScPoints();
    const bloodAlcoholLevel = section.getBloodAlcoholLevel();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={sectionNumber.label} labelFor={sectionNumber.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={sectionNumber.id}
                            disabled={!sectionNumber.getIsEnabled()}
                            invalid={sectionNumber.getHasError()}
                            value={sectionNumber.getValue()}
                            onChange={(value) => binding.setValue(section.sectionNumber, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={description.label} labelFor={description.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={description.id}
                            disabled={!description.getIsEnabled()}
                            invalid={description.getHasError()}
                            value={description.getValue()}
                            onChange={(value) => binding.setValue(section.description, value)}
                        />
                    </FFieldControl>
                </div>
                {/* courtAppearanceRequiredYes/No are not yet wired to an input */}
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={dateOfViolation.label} labelFor={dateOfViolation.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={dateOfViolation.id}
                            disabled={!dateOfViolation.getIsEnabled()}
                            invalid={dateOfViolation.getHasError()}
                            value={dateOfViolation.getValue()}
                            onChange={(value) => binding.setValue(section.dateOfViolation, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={timeOfViolation.label} labelFor={timeOfViolation.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={timeOfViolation.id}
                            disabled={!timeOfViolation.getIsEnabled()}
                            invalid={timeOfViolation.getHasError()}
                            value={timeOfViolation.getValue()}
                            onChange={(value) => binding.setValue(section.timeOfViolation, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={scPoints.label} labelFor={scPoints.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={scPoints.id}
                            disabled={!scPoints.getIsEnabled()}
                            invalid={scPoints.getHasError()}
                            value={scPoints.getValue()}
                            onChange={(value) => binding.setValue(section.scPoints, Number(value))}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={bloodAlcoholLevel.label} labelFor={bloodAlcoholLevel.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={bloodAlcoholLevel.id}
                            disabled={!bloodAlcoholLevel.getIsEnabled()}
                            invalid={bloodAlcoholLevel.getHasError()}
                            value={bloodAlcoholLevel.getValue()}
                            onChange={(value) => binding.setValue(section.bloodAlcoholLevel, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
