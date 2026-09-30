import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection, FSelectField, FTextField } from "@forms/core";

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

    const loadStateOptions = useCallback(() => publicContactOrWarningService.getStateOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FTextField field={section.getFirstName()} borderEdges={["top"]} width={323} onChange={(value) => binding.setValue(section.firstName, value)} />
                <FTextField field={section.getMiddleInitial()} borderEdges={["left", "top"]} width={65} onChange={(value) => binding.setValue(section.middleInitial, value)} />
                <FTextField field={section.getLastName()} borderEdges={["left", "top"]} width={200} onChange={(value) => binding.setValue(section.lastName, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal" height={44}>
                <FSelectField
                    field={section.getLicensedState()}
                    load={loadStateOptions}
                    borderEdges={["top"]}
                    format="valueOnly"
                    width={118}
                    onChange={(value) => binding.setValue(section.licensedState, value)}
                />
                <FTextField field={section.getDriverLicenseNumber()} borderEdges={["left", "top"]} width={470} onChange={(value) => binding.setValue(section.driverLicenseNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
