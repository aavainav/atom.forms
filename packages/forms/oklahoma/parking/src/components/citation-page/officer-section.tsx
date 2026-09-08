import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { OfficerSectionModel } from "../../models/citation-page/officer-section";

interface IOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OfficerSectionModel>;
}

/** Defines the officer section of the Oklahoma City parking violation form's citation page. */
export const OfficerSection = ({ binding }: IOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const officerName = section.getOfficerName();
    const commissionNumber = section.getCommissionNumber();

    return (
        <FSection>
            <div className="small mt-3">The above information is true and correct:</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={officerName.label} labelFor={officerName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={officerName.id}
                            disabled={!officerName.getIsEnabled()}
                            invalid={officerName.getHasError()}
                            value={officerName.getValue()}
                            onChange={(value) => binding.setValue(section.officerName, value)}
                        />
                    </FFieldControl>
                </div>
                <FFieldControl width={160} label={commissionNumber.label} labelFor={commissionNumber.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={commissionNumber.id}
                        alphanumeric
                        disabled={!commissionNumber.getIsEnabled()}
                        invalid={commissionNumber.getHasError()}
                        value={commissionNumber.getValue()}
                        onChange={(value) => binding.setValue(section.commissionNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
