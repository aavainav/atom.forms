import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { PersonSectionModel } from "../../models/record-page/person-section";
import { IPublicContactOrWarningService } from "../../services";

interface IPersonSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
}

/** Defines the person section (the person contacted) of the public contact/warning record. */
export const PersonSection = ({ binding }: IPersonSectionProps): React.JSX.Element => {
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
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={firstName.label} labelFor={firstName.id} width={323}>
                    <FFieldInput
                        id={firstName.id}
                        disabled={!firstName.getIsEnabled()}
                        invalid={firstName.getHasError()}
                        value={firstName.getValue()}
                        onChange={(value) => binding.setValue(section.firstName, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={middleInitial.label} labelFor={middleInitial.id} width={65}>
                    <FFieldInput
                        id={middleInitial.id}
                        disabled={!middleInitial.getIsEnabled()}
                        invalid={middleInitial.getHasError()}
                        value={middleInitial.getValue()}
                        onChange={(value) => binding.setValue(section.middleInitial, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={lastName.label} labelFor={lastName.id} width={200}>
                    <FFieldInput
                        id={lastName.id}
                        disabled={!lastName.getIsEnabled()}
                        invalid={lastName.getHasError()}
                        value={lastName.getValue()}
                        onChange={(value) => binding.setValue(section.lastName, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top"]} label={licensedState.label} labelFor={licensedState.id} width={118}>
                    <FFieldSelect
                        id={licensedState.id}
                        disabled={!licensedState.getIsEnabled()}
                        format="valueOnly"
                        invalid={licensedState.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={licensedState.getValue()}
                        onChange={(value) => binding.setValue(section.licensedState, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top"]} label={driverLicenseNumber.label} labelFor={driverLicenseNumber.id} width={470}>
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
