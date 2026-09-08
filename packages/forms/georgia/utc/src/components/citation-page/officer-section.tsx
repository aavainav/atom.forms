import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { OfficerSectionModel } from "../../models/citation-page/officer-section";
import { TextBox } from "../fields";

interface IOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OfficerSectionModel>;
}

/** Defines the officer boxes printed at the foot of Section III. */
export const OfficerSection = ({ binding }: IOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const officerName = section.getOfficerName();
    const apdIdNumber = section.getApdIdNumber();
    const assignment = section.getAssignment();
    const courtCode = section.getCourtCode();
    const offDays = section.getOffDays();
    const time = section.getTime();
    const secondOfficerName = section.getSecondOfficerName();
    const secondApdIdNumber = section.getSecondApdIdNumber();
    const secondAssignment = section.getSecondAssignment();
    const secondCourtCode = section.getSecondCourtCode();
    const secondOffDays = section.getSecondOffDays();
    const secondTime = section.getSecondTime();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={officerName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.officerName, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={apdIdNumber} width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.apdIdNumber, value)} />
                <div className="w-100"><TextBox field={assignment} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.assignment, value)} /></div>
                <TextBox field={courtCode} width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.courtCode, value)} />
                <TextBox field={offDays} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.offDays, value)} />
                <TextBox field={time} width={130} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.time, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={secondOfficerName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.secondOfficerName, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={secondApdIdNumber} width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondApdIdNumber, value)} />
                <div className="w-100"><TextBox field={secondAssignment} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondAssignment, value)} /></div>
                <TextBox field={secondCourtCode} width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondCourtCode, value)} />
                <TextBox field={secondOffDays} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondOffDays, value)} />
                <TextBox field={secondTime} width={130} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.secondTime, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
