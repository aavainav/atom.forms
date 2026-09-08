import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { HeaderSectionModel } from "../../models/collision-page/header-section";
import { TextField } from "../fields";

interface IHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<HeaderSectionModel>;
}

/** Defines the header of the TR-310, carrying the page numbering, the report number, and the times the report records. */
export const HeaderSection = ({ binding }: IHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <div className="text-center">
                <h5 className="fw-bold mb-0">SOUTH CAROLINA TRAFFIC COLLISION REPORT FORM</h5>
                <h6 className="fw-bold mb-0">TR-310 (Rev. 7/2024)</h6>
            </div>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getPageNumber()} width={60} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.pageNumber, value)} />
                <TextField field={section.getPageCount()} width={60} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.pageCount, value)} />
                <TextField field={section.getVersion()} width={60} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.version, value)} />
                <TextField field={section.getUnitCount()} width={80} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.unitCount, Number(value))} />
                <TextField field={section.getCrashReportNumber()} width={220} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.crashReportNumber, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getAmended()} width={96} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.amended, value)} />
                <TextField field={section.getCorrected()} width={96} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.corrected, value)} />
                <TextField field={section.getOfficerNotified()} width={96} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.officerNotified, value)} />
                <TextField field={section.getOfficerArrived()} width={96} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.officerArrived, value)} />
                <TextField field={section.getRoadwayCleared()} width={96} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.roadwayCleared, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
