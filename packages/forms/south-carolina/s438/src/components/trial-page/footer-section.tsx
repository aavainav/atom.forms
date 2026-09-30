import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection, FTextField } from "@forms/core";

import { TrialFooterSectionModel } from "../../models/trial-page/footer-section";

interface ITrialFooterSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialFooterSectionModel>;
}

/** Defines the footer section for the trial page of the S438 citation form: which copy this is, and the ticket number. */
export default function TrialFooterSection({ binding }: ITrialFooterSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FBorder width={294} borderEdges="all">
                    <FLabel fontSize="6"><span className="fw-bold">Electronic Copy - Trial</span></FLabel>
                    <FLabel fontSize="6"><span className="fw-bold">Officer / Driver's Record</span></FLabel>
                </FBorder>
                <FTextField field={section.getTicketNumber()} width={294} borderEdges={["top", "right", "bottom"]} onChange={(value) => binding.setValue(section.ticketNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
