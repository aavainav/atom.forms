import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { AgencySectionModel } from "../../models/record-page/agency-section";
import { IPublicContactOrWarningService } from "../../services";
import { PublicContactOrWarningValueListId } from "../../value-lists";

interface IAgencySectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<AgencySectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the agency section of the public contact/warning record. */
export const AgencySection = ({ binding, valueListController }: IAgencySectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const agencyName = section.getAgencyName();
    const city = section.getCity();
    const county = section.getCounty();

    const loadCountyOptions = useCallback(() => publicContactOrWarningService.getCountyOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <div className="text-center mb-2">
                <h4 className="fw-bold mb-0">STATE OF SOUTH CAROLINA</h4>
                <h4 className="fw-bold mb-0">PUBLIC CONTACT / WARNING</h4>
            </div>
            <FFormStackPanel direction="horizontal">
                <FFieldControl border="hidden" label={agencyName.label} labelFor={agencyName.id} width={350}>
                    <FFieldInput
                        id={agencyName.id}
                        disabled={!agencyName.getIsEnabled()}
                        invalid={agencyName.getHasError()}
                        value={agencyName.getValue()}
                        onChange={(value) => binding.setValue(section.agencyName, value)}
                    />
                </FFieldControl>
                <FFormStackPanel direction="vertical">
                    <FFieldControl border="hidden" height={20} label={city.label} labelFor={city.id} width={200}>
                        <FFieldInput
                            id={city.id}
                            disabled={!city.getIsEnabled()}
                            invalid={city.getHasError()}
                            margin={{ start: 40 }}
                            padding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                            value={city.getValue()}
                            onChange={(value) => binding.setValue(section.city, value)}
                        />
                    </FFieldControl>
                    <FFieldControl border="hidden" height={20} label={county.label} labelFor={county.id} width={240}>
                        <FFieldSelect
                            id={county.id}
                            cacheKey={PublicContactOrWarningValueListId.county}
                            controller={valueListController}
                            disabled={!county.getIsEnabled()}
                            format="descriptionOnly"
                            invalid={county.getHasError()}
                            options={loadCountyOptions}
                            padding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                            value={county.getValue()}
                            onChange={(value) => binding.setValue(section.county, value as IOptionValue)}
                        />
                    </FFieldControl>
                </FFormStackPanel>
            </FFormStackPanel>
        </FSection>
    );
};
