import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { CertificationSectionModel } from "../../models/complaint-page/certification-section";

interface ICertificationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CertificationSectionModel>;
}

/** Defines the clerk's certification section of the Oklahoma City parking violation form's complaint page. */
export const CertificationSection = ({ binding }: ICertificationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const clerkSignature = section.getClerkSignature();
    const date = section.getDate();

    return (
        <FSection>
            <p className="small mt-4 mb-3">I CERTIFY THAT THIS IS A TRUE AND CORRECT COPY OF THE UPDATED RECORD.</p>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={clerkSignature.label} labelFor={clerkSignature.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={clerkSignature.id}
                            disabled={!clerkSignature.getIsEnabled()}
                            invalid={clerkSignature.getHasError()}
                            value={clerkSignature.getValue()}
                            onChange={(value) => binding.setValue(section.clerkSignature, value)}
                        />
                    </FFieldControl>
                </div>
                <FFieldControl width={160} label={date.label} labelFor={date.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={date.id}
                        type="date"
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
