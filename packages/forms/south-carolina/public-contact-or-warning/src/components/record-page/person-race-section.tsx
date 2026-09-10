import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { PersonSectionModel } from "../../models/record-page/person-section";
import { IPublicContactOrWarningService } from "../../services";
import { PublicContactOrWarningValueListId } from "../../value-lists";

interface IPersonRaceSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the person race section (the person contacted) of the public contact/warning record. */
export const PersonRaceSection = ({ binding, valueListController }: IPersonRaceSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const race = section.getRace();
    const gender = section.getGender();
    const dateOfBirth = section.getDateOfBirth();

    const loadGenderOptions = useCallback(() => publicContactOrWarningService.getGenderOptions(), [publicContactOrWarningService]);
    const loadRaceOptions = useCallback(() => publicContactOrWarningService.getRaceOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={race.label} labelFor={race.id} width={118}>
                    <FFieldSelect
                        id={race.id}
                        cacheKey={PublicContactOrWarningValueListId.raceEthnicity}
                        controller={valueListController}
                        disabled={!race.getIsEnabled()}
                        format="valueOnly"
                        invalid={race.getHasError()}
                        options={loadRaceOptions}
                        value={race.getValue()}
                        onChange={(value) => binding.setValue(section.race, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={gender.label} labelFor={gender.id} width={85}>
                    <FFieldSelect
                        id={gender.id}
                        cacheKey={PublicContactOrWarningValueListId.gender}
                        controller={valueListController}
                        disabled={!gender.getIsEnabled()}
                        format="valueOnly"
                        invalid={gender.getHasError()}
                        options={loadGenderOptions}
                        value={gender.getValue()}
                        onChange={(value) => binding.setValue(section.gender, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={dateOfBirth.label} labelFor={dateOfBirth.id} width={178}>
                    <FFieldInput
                        id={dateOfBirth.id}
                        disabled={!dateOfBirth.getIsEnabled()}
                        invalid={dateOfBirth.getHasError()}
                        type="date"
                        value={dateOfBirth.getValue()}
                        onChange={(value) => binding.setValue(section.dateOfBirth, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
