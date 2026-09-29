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
                <div className="w-100">
                    <FTextField field={section.getOfficerName()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.officerName, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getOfficerRank()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.officerRank, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getSccjaOfficerNumber()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.sccjaOfficerNumber, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getBailDeposited()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.bailDeposited, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getDateOfArrest()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfArrest, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getBondAmountRequested()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bondAmountRequested, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-50">
                    <FTextField field={section.getDateBailReceived()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateBailReceived, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getBailReceivedBy()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bailReceivedBy, value)} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
