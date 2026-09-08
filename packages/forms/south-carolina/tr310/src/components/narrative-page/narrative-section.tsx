import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { NarrativeSectionModel } from "../../models/narrative-page/narrative-section";
import { TextField } from "../fields";

interface INarrativeSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NarrativeSectionModel>;
}

/** Defines the narrative section of the TR-310 - the officer's account of the collision and the notes explaining an amendment. */
export const NarrativeSection = ({ binding }: INarrativeSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="vertical">
                <TextField field={section.getText()} height={240} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.text, value)} />
                <TextField field={section.getAmendedOrCorrectedNotes()} height={90} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.amendedOrCorrectedNotes, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
