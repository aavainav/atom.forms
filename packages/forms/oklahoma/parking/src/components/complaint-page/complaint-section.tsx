import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { ComplaintSectionModel } from "../../models/complaint-page/complaint-section";

interface IComplaintSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ComplaintSectionModel>;
}

/** Defines the complaint section of the Oklahoma City parking violation form's complaint page. */
export const ComplaintSection = ({ binding }: IComplaintSectionProps): React.JSX.Element => {
    const section = binding.get();
    const citationNumber = section.getCitationNumber();
    const counselor = section.getCounselor();
    const date = section.getDate();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={260} label={citationNumber.label} labelFor={citationNumber.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={citationNumber.id}
                        alphanumeric
                        disabled={!citationNumber.getIsEnabled()}
                        invalid={citationNumber.getHasError()}
                        value={citationNumber.getValue()}
                        onChange={(value) => binding.setValue(section.citationNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <p className="small mt-3 mb-0">
                The within and foregoing Complaint on page one hereof which is herein included by reference, has been
                examined and there is probable cause for filing this information.
            </p>
            <p className="small mb-3">Municipal Counselor, Oklahoma City, Oklahoma</p>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={counselor.label} labelFor={counselor.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={counselor.id}
                            disabled={!counselor.getIsEnabled()}
                            invalid={counselor.getHasError()}
                            value={counselor.getValue()}
                            onChange={(value) => binding.setValue(section.counselor, value)}
                        />
                    </FFieldControl>
                </div>
                <FFieldControl width={160} label={date.label} labelFor={date.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={date.id}
                        type="date"
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
