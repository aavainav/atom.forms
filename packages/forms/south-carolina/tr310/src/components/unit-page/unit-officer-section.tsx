import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { UnitOfficerSectionModel } from "../../models/unit-page/unit-officer-section";
import { TextField } from "../fields";

interface IUnitOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<UnitOfficerSectionModel>;
}

/** Defines the unit page's officer footer. */
export const UnitOfficerSection = ({ binding }: IUnitOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getOfficerName()} width={280} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.officerName, value)} />
                <TextField field={section.getRank()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.rank, value)} />
                <TextField field={section.getCjaNumber()} width={110} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.cjaNumber, value)} />
                <TextField field={section.getInternalAgency()} width={300} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.internalAgency, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
