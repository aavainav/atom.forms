import React from "react";
import { ISectionBinding, FBorder, FFieldControl, FFieldInput, FFormStackPanel, FSection, FLabel } from "@forms/core";

import { PersonSectionModel } from "../../models/record-page/person-section";

interface ILatitudeLongitudeSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PersonSectionModel>;
}

/** Defines the latitude/longitude section of the public contact/warning record. */
export const LatitudeLongitudeSection = ({ binding }: ILatitudeLongitudeSectionProps): React.JSX.Element => {
    const section = binding.get();
    const latitude = section.getLatitude();
    const longitude = section.getLongitude();

    return (
        <FSection>
            <FFormStackPanel direction="vertical">
                <FFormStackPanel direction="horizontal">
                    <FBorder width={100} height={22} borderEdges={["left", "top"]}>
                        <FLabel fontSize="6" textAlignment="center">LATITUDE</FLabel>
                    </FBorder>
                    <FFieldControl width={107} height={22} label={latitude.label} labelFor={latitude.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={latitude.id}
                            disabled={!latitude.getIsEnabled()}
                            invalid={latitude.getHasError()}
                            value={latitude.getValue()}
                            onChange={(value) => binding.setValue(section.latitude, value)}
                        />
                    </FFieldControl>
                </FFormStackPanel>
                <FFormStackPanel direction="horizontal">
                    <FBorder width={100} height={22} borderEdges={["left", "top"]}>
                        <FLabel fontSize="6" textAlignment="center">LONGITUDE</FLabel>
                    </FBorder>
                    <FFieldControl width={107} height={22} label={longitude.label} labelFor={longitude.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={longitude.id}
                            disabled={!longitude.getIsEnabled()}
                            invalid={longitude.getHasError()}
                            value={longitude.getValue()}
                            onChange={(value) => binding.setValue(section.longitude, value)}
                        />
                    </FFieldControl>
                </FFormStackPanel>
            </FFormStackPanel>
        </FSection>
    );
};
