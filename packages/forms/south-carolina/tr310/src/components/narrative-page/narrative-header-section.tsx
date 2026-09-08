import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { NarrativeHeaderSectionModel } from "../../models/narrative-page/narrative-header-section";
import { TextField } from "../fields";

interface INarrativeHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NarrativeHeaderSectionModel>;
}

/** Defines the narrative page's header. */
export const NarrativeHeaderSection = ({ binding }: INarrativeHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getInternalAgencyCode()} width={240} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.internalAgencyCode, value)} />
                <TextField field={section.getCrashReportNumber()} width={280} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.crashReportNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
