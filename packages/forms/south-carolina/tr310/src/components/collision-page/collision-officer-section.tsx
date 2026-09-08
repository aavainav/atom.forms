import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { CollisionOfficerSectionModel } from "../../models/collision-page/collision-officer-section";
import { TextField } from "../fields";

interface ICollisionOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CollisionOfficerSectionModel>;
}

/** Defines the collision page's officer footer, which carries the reviewer as well as the investigating officer. */
export const CollisionOfficerSection = ({ binding }: ICollisionOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getOfficerName()} width={280} maxlength={50} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.officerName, value)} />
                <TextField field={section.getRank()} width={90} maxlength={6} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.rank, value)} />
                <TextField field={section.getCjaNumber()} width={110} maxlength={10} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.cjaNumber, value)} />
                <TextField field={section.getJurisdiction()} width={300} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.jurisdiction, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getReviewerName()} width={280} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.reviewerName, value)} />
                <TextField field={section.getReviewerRank()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.reviewerRank, value)} />
                <TextField field={section.getReviewDate()} width={110} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.reviewDate, value)} />
                <TextField field={section.getInternalAgency()} width={300} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.internalAgency, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
