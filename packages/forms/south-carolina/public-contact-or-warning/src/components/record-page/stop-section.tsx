import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection, FSelectField, FTextField } from "@forms/core";

import { StopSectionModel } from "../../models/record-page/stop-section";
import { IPublicContactOrWarningService } from "../../services";

interface IStopSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<StopSectionModel>;
}

/** Defines the stop section (CTY/Date/Time/CAD Call Number) of the public contact/warning record. */
export const StopSection = ({ binding }: IStopSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const loadCountyOptions = useCallback(() => publicContactOrWarningService.getCountyOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FSelectField
                    field={section.getCounty()}
                    load={loadCountyOptions}
                    borderEdges={["top", "bottom"]}
                    format="valueOnly"
                    searchable={false}
                    width={75}
                    onChange={(value) => binding.setValue(section.county, value)}
                />
                <FTextField field={section.getDate()} borderEdges={["left", "top", "bottom"]} type="date" width={178} onChange={(value) => binding.setValue(section.date, value)} />
                <FTextField field={section.getTime()} borderEdges={["left", "top", "bottom"]} width={130} onChange={(value) => binding.setValue(section.time, value)} />
                <FTextField field={section.getCadCallNumber()} borderEdges={["left", "top", "bottom"]} width={205} onChange={(value) => binding.setValue(section.cadCallNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
