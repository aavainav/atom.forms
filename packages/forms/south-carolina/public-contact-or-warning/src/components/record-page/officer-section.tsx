import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { OfficerSectionModel } from "../../models/record-page/officer-section";

interface IOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OfficerSectionModel>;
}

/** Defines the officer section of the public contact/warning record. */
export const OfficerSection = ({ binding }: IOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const issuedBy = section.getIssuedBy();
    const rank = section.getRank();
    const scCjaNumber = section.getScCjaNumber();

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={373} label={issuedBy.label} labelFor={issuedBy.id} borderEdges={["top", "bottom"]}>
                    <FFieldInput
                        id={issuedBy.id}
                        disabled={!issuedBy.getIsEnabled()}
                        invalid={issuedBy.getHasError()}
                        value={issuedBy.getValue()}
                        onChange={(value) => binding.setValue(section.issuedBy, value)}
                    />
                </FFieldControl>
                <FFieldControl width={100} label={rank.label} labelFor={rank.id} borderEdges={["left", "top", "bottom"]}>
                    <FFieldInput
                        id={rank.id}
                        disabled={!rank.getIsEnabled()}
                        invalid={rank.getHasError()}
                        value={rank.getValue()}
                        onChange={(value) => binding.setValue(section.rank, value)}
                    />
                </FFieldControl>
                <FFieldControl width={115} label={scCjaNumber.label} labelFor={scCjaNumber.id} borderEdges={["left", "top", "bottom"]}>
                    <FFieldInput
                        id={scCjaNumber.id}
                        disabled={!scCjaNumber.getIsEnabled()}
                        invalid={scCjaNumber.getHasError()}
                        value={scCjaNumber.getValue()}
                        onChange={(value) => binding.setValue(section.scCjaNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
