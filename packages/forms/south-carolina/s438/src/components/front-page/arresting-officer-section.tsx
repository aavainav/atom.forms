import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { ArrestingOfficerSectionModel } from "../../models/front-page/arresting-officer-section";

interface IArrestingOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ArrestingOfficerSectionModel>;
}

/** Defines the arresting officer section for the front page of the S438 citation form. */
export default function ArrestingOfficerSection({ binding }: IArrestingOfficerSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getOfficerName()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.officerName, value)} />
                <FTextField field={section.getOfficerRank()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.officerRank, value)} />
                <FTextField field={section.getSccjaOfficerNumber()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.sccjaOfficerNumber, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getBailDeposited()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.bailDeposited, value)} />
                <FTextField field={section.getDateOfArrest()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfArrest, value)} />
                <FTextField field={section.getBondAmountRequested()} width={196} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bondAmountRequested, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
