import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { ComplaintSectionModel } from "../../models/warrant-page/complaint-section";
import { TextBox } from "../fields";

interface IComplaintSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ComplaintSectionModel>;
}

/** Defines the complaint section of the Oklahoma City traffic citation form's warrant page. */
export const ComplaintSection = ({ binding }: IComplaintSectionProps): React.JSX.Element => {
    const section = binding.get();
    const citationNumber = section.getCitationNumber();
    const counselor = section.getCounselor();
    const date = section.getDate();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <TextBox field={citationNumber} width={280} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.citationNumber, value)} />
            </FFormStackPanel>
            <p className="small mt-3 mb-0">
                The within and foregoing Complaint on page one hereof which is herein included by reference, has been
                examined and there is probable cause for filing this information.
            </p>
            <p className="small mb-3">Municipal Counselor, Oklahoma City, Oklahoma</p>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={counselor} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.counselor, value)} /></div>
                <TextBox field={date} type="date" width={170} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.date, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
