import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { OfficerSectionModel } from "../../models/record-page/officer-section";

interface IOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OfficerSectionModel>;
}

/** Defines the officer section of the public contact/warning record. */
export const OfficerSection = ({ binding }: IOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FTextField field={section.getIssuedBy()} borderEdges={["top", "bottom"]} width={373} onChange={(value) => binding.setValue(section.issuedBy, value)} />
                <FTextField field={section.getRank()} borderEdges={["left", "top", "bottom"]} width={100} onChange={(value) => binding.setValue(section.rank, value)} />
                <FTextField field={section.getScCjaNumber()} borderEdges={["left", "top", "bottom"]} width={115} onChange={(value) => binding.setValue(section.scCjaNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
