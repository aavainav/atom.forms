import React from "react";
import { ISectionBinding, FCheckboxField, FFormStackPanel, FLabel, FSection, FTextField } from "@forms/core";

import { TrialHeaderSectionModel } from "../../models/trial-page/header-section";

interface ITrialHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialHeaderSectionModel>;
}

/** Defines the header section for the trial page of the S438 citation form: whether the copy is void, notes on it, and the ticket's title. */
export default function TrialHeaderSection({ binding }: ITrialHeaderSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FCheckboxField field={section.getVoid()} onChange={(checked) => binding.setValue(section.void, checked)} />
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getNotes()} width={588} borderEdges={[]} onChange={(value) => binding.setValue(section.notes, value)} />
            </FFormStackPanel>
            <div className="border border-bottom-0 border-dark text-center">
                <FLabel fontSize="6" textAlignment="start">Form S-438 Rev.08/2017</FLabel>
                <h4>UNIFORM TRAFFIC TICKET</h4>
                <h6 className="mb-0">STATE OF SOUTH CAROLINA</h6>
                <h6 className="mb-0">VERSUS</h6>
            </div>
        </FSection>
    );
}
