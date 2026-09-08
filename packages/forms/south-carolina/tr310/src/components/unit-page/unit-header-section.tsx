import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { UnitHeaderSectionModel } from "../../models/unit-page/unit-header-section";
import { TextField } from "../fields";

interface IUnitHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<UnitHeaderSectionModel>;
}

/** Defines the unit page's header, identifying which unit the page records. */
export const UnitHeaderSection = ({ binding }: IUnitHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getUnitNumber()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.unitNumber, value)} />
                <TextField field={section.getFr10Number()} width={160} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.fr10Number, value)} />
                <TextField field={section.getCrashReportNumber()} width={240} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.crashReportNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
