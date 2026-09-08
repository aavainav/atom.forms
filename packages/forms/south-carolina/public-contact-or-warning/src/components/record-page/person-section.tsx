import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { PersonSectionModel } from "../../models/record-page/person-section";
import { IPublicContactOrWarningService } from "../../services";

interface IPersonSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the person section (the person contacted) of the public contact/warning record. */
export const PersonSection = ({ binding, valueListController }: IPersonSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const firstName = section.getFirstName();
    const middleInitial = section.getMiddleInitial();
    const lastName = section.getLastName();
    const licensedState = section.getLicensedState();
    const driverLicenseNumber = section.getDriverLicenseNumber();

    const loadStateOptions = useCallback(() => publicContactOrWarningService.getStateOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={323} label={firstName.label} labelFor={firstName.id} borderEdges={["top"]}>
                    <FFieldInput
                        id={firstName.id}
                        disabled={!firstName.getIsEnabled()}
                        invalid={firstName.getHasError()}
                        value={firstName.getValue()}
                        onChange={(value) => binding.setValue(section.firstName, value)}
                    />
                </FFieldControl>
                <FFieldControl width={65} label={middleInitial.label} labelFor={middleInitial.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={middleInitial.id}
                        disabled={!middleInitial.getIsEnabled()}
                        invalid={middleInitial.getHasError()}
                        value={middleInitial.getValue()}
                        onChange={(value) => binding.setValue(section.middleInitial, value)}
                    />
                </FFieldControl>
                <FFieldControl width={200} label={lastName.label} labelFor={lastName.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={lastName.id}
                        disabled={!lastName.getIsEnabled()}
                        invalid={lastName.getHasError()}
                        value={lastName.getValue()}
                        onChange={(value) => binding.setValue(section.lastName, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={118} label={licensedState.label} labelFor={licensedState.id} borderEdges={["top"]}>
                    <FFieldSelect
                        id={licensedState.id}
                        cacheKey={ValueListId.state}
                        controller={valueListController}
                        disabled={!licensedState.getIsEnabled()}
                        format="valueOnly"
                        invalid={licensedState.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={licensedState.getValue()}
                        onChange={(value) => binding.setValue(section.licensedState, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl width={470} label={driverLicenseNumber.label} labelFor={driverLicenseNumber.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={driverLicenseNumber.id}
                        disabled={!driverLicenseNumber.getIsEnabled()}
                        invalid={driverLicenseNumber.getHasError()}
                        value={driverLicenseNumber.getValue()}
                        onChange={(value) => binding.setValue(section.driverLicenseNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
