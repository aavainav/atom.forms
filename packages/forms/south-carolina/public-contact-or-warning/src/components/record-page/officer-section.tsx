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
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top", "bottom"]} label={issuedBy.label} labelFor={issuedBy.id} width={373}>
                    <FFieldInput
                        id={issuedBy.id}
                        disabled={!issuedBy.getIsEnabled()}
                        invalid={issuedBy.getHasError()}
                        value={issuedBy.getValue()}
                        onChange={(value) => binding.setValue(section.issuedBy, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top", "bottom"]} label={rank.label} labelFor={rank.id} width={100}>
                    <FFieldInput
                        id={rank.id}
                        disabled={!rank.getIsEnabled()}
                        invalid={rank.getHasError()}
                        value={rank.getValue()}
                        onChange={(value) => binding.setValue(section.rank, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top", "bottom"]} label={scCjaNumber.label} labelFor={scCjaNumber.id} width={115}>
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
