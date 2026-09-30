import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection, FSelectField, FTextField } from "@forms/core";

import { AgencySectionModel } from "../../models/record-page/agency-section";
import { IPublicContactOrWarningService } from "../../services";

interface IAgencySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<AgencySectionModel>;
}

/** Defines the agency section of the public contact/warning record. */
export const AgencySection = ({ binding }: IAgencySectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const loadCountyOptions = useCallback(() => publicContactOrWarningService.getCountyOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <div className="text-center mb-2">
                <h4 className="fw-bold mb-0">STATE OF SOUTH CAROLINA</h4>
                <h4 className="fw-bold mb-0">PUBLIC CONTACT / WARNING</h4>
            </div>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getAgencyName()} border="hidden" width={350} onChange={(value) => binding.setValue(section.agencyName, value)} />
                <FFormStackPanel direction="vertical">
                    <FTextField
                        field={section.getCity()}
                        border="hidden"
                        height={20}
                        inputMargin={{ start: 40 }}
                        inputPadding={0}
                        width={200}
                        onChange={(value) => binding.setValue(section.city, value)}
                    />
                    <FSelectField
                        field={section.getCounty()}
                        load={loadCountyOptions}
                        border="hidden"
                        height={20}
                        inputPadding={0}
                        searchable={false}
                        width={240}
                        onChange={(value) => binding.setValue(section.county, value)}
                    />
                </FFormStackPanel>
            </FFormStackPanel>
        </FSection>
    );
};
