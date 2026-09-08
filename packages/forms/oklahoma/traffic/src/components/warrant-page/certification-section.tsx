import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { CertificationSectionModel } from "../../models/warrant-page/certification-section";
import { TextBox } from "../fields";

interface ICertificationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CertificationSectionModel>;
}

/** Defines the clerk's certification section of the Oklahoma City traffic citation form's warrant page. */
export const CertificationSection = ({ binding }: ICertificationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const clerkSignature = section.getClerkSignature();
    const date = section.getDate();

    return (
        <FSection>
            <p className="small mt-4 mb-3">I CERTIFY THAT THIS IS A TRUE AND CORRECT COPY OF THE UPDATED RECORD.</p>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={clerkSignature} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.clerkSignature, value)} /></div>
                <TextBox field={date} type="date" width={170} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.date, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
