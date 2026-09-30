import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection, FSelectField, FTextField } from "@forms/core";

import { PersonSectionModel } from "../../models/record-page/person-section";
import { IPublicContactOrWarningService } from "../../services";

interface IPersonRaceSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
}

/** Defines the person race section (the person contacted) of the public contact/warning record. */
export const PersonRaceSection = ({ binding }: IPersonRaceSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const loadGenderOptions = useCallback(() => publicContactOrWarningService.getGenderOptions(), [publicContactOrWarningService]);
    const loadRaceOptions = useCallback(() => publicContactOrWarningService.getRaceOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FSelectField
                    field={section.getRace()}
                    load={loadRaceOptions}
                    borderEdges={["top"]}
                    format="valueOnly"
                    searchable={false}
                    width={118}
                    onChange={(value) => binding.setValue(section.race, value)}
                />
                <FSelectField
                    field={section.getGender()}
                    load={loadGenderOptions}
                    borderEdges={["left", "top"]}
                    format="valueOnly"
                    searchable={false}
                    width={85}
                    onChange={(value) => binding.setValue(section.gender, value)}
                />
                <FTextField field={section.getDateOfBirth()} borderEdges={["left", "top"]} type="date" width={178} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
