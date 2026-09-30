import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection, FTextField } from "@forms/core";

import { PersonSectionModel } from "../../models/record-page/person-section";

interface ILatitudeLongitudeSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
}

/** Defines the latitude/longitude section of the public contact/warning record. */
export const LatitudeLongitudeSection = ({ binding }: ILatitudeLongitudeSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FFormStackPanel direction="vertical">
                <FFormStackPanel direction="horizontal">
                    <FBorder borderEdges={["left", "top"]} height={22} width={100}>
                        <FLabel fontSize="6" textAlignment="center">LATITUDE</FLabel>
                    </FBorder>
                    <FTextField
                        field={section.getLatitude()}
                        borderEdges={["left", "top"]}
                        height={22}
                        inputPadding={{ start: 5, top: 0, end: 0, bottom: 0 }}
                        width={107}
                        onChange={(value) => binding.setValue(section.latitude, value)}
                    />
                </FFormStackPanel>
                <FFormStackPanel direction="horizontal">
                    <FBorder borderEdges={["left", "top"]} height={22} width={100}>
                        <FLabel fontSize="6" textAlignment="center">LONGITUDE</FLabel>
                    </FBorder>
                    <FTextField
                        field={section.getLongitude()}
                        borderEdges={["left", "top"]}
                        height={22}
                        inputPadding={{ start: 5, top: 0, end: 0, bottom: 0 }}
                        width={107}
                        onChange={(value) => binding.setValue(section.longitude, value)}
                    />
                </FFormStackPanel>
            </FFormStackPanel>
        </FSection>
    );
};
