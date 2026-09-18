import React from "react";
import { ISectionBinding, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { DiagramSectionModel } from "../../models/narrative-page/diagram-section";
import { TextField } from "../fields";

interface IDiagramSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DiagramSectionModel>;
}

/** The diagram section of the TR-310. Held as serialized content rather than a drawing surface, so the report carries whatever a host's diagram editor produced, and this section is where it lands. */
export const DiagramSection = ({ binding }: IDiagramSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">DIAGRAM</span></FLabel>
            <FFormStackPanel direction="vertical">
                <TextField field={section.getContent()} height={320} borderEdges={["top", "left", "right", "bottom"]} onChange={(value) => binding.setValue(section.content, value)} />
            </FFormStackPanel>
            <div className="px-2 py-1">
                <small className="fw-bold">
                    NOTICE &ndash; THE TR-310 IS FOR STATISTICAL REPORTING PURPOSES ONLY AND IS A REFLECTION OF THE OFFICER'S BEST KNOWLEDGE,
                    OPINION, AND BELIEF COVERING THE COLLISION BUT NO WARRANT IS MADE AS TO THE FACTUAL ACCURACY THEREOF.
                </small>
            </div>
        </FSection>
    );
};
