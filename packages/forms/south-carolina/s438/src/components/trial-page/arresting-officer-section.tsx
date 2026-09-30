import React from "react";
import { ISectionBinding, FFormStackPanel, FSection, FTextField } from "@forms/core";

import { TrialArrestingOfficerSectionModel } from "../../models/trial-page/arresting-officer-section";

interface ITrialArrestingOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialArrestingOfficerSectionModel>;
}

/** Defines the arresting officer section for the trial page of the S438 citation form, with the bail and when it was received. */
export default function TrialArrestingOfficerSection({ binding }: ITrialArrestingOfficerSectionProps): React.JSX.Element {
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
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getDateBailReceived()} width={196} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateBailReceived, value)} />
                <FTextField field={section.getBailReceivedBy()} width={392} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bailReceivedBy, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
