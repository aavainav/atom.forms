import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { ArraignmentSectionModel } from "../../models/complaint-page/arraignment-section";
import { TextBox } from "../fields";

interface IArraignmentSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ArraignmentSectionModel>;
}

/** Defines the defendant's promise to appear on the Oklahoma City traffic citation form's complaint page. */
export const ArraignmentSection = ({ binding }: IArraignmentSectionProps): React.JSX.Element => {
    const section = binding.get();
    const courtDate = section.getCourtDate();
    const courtTime = section.getCourtTime();
    const defendantSignature = section.getDefendantSignature();

    return (
        <FSection>
            <FBorder border="visible">
                <p className="small m-3">
                    Without admitting guilt, I promise to appear in Oklahoma City Municipal Court at the date and
                    time shown below.
                </p>
                <FFormStackPanel direction="horizontal">
                    <TextBox field={courtDate} type="date" width={230} borderEdges={["top"]} onChange={(value) => binding.setValue(section.courtDate, value)} />
                    <div className="w-100"><TextBox field={courtTime} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.courtTime, value)} /></div>
                </FFormStackPanel>
                <FFormStackPanel direction="horizontal">
                    <div className="w-100"><TextBox field={defendantSignature} borderEdges={["top"]} onChange={(value) => binding.setValue(section.defendantSignature, value)} /></div>
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
}
