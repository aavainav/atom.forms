import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { CoordinatesSectionModel } from "../../models/collision-page/coordinates-section";
import { TextField } from "../fields";

interface ICoordinatesSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CoordinatesSectionModel>;
}

/** Defines the GPS coordinates section of the TR-310. The bounds printed beside the boxes are South Carolina's, and the rules enforce them. */
export const CoordinatesSection = ({ binding }: ICoordinatesSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">GPS COORDINATES DECIMAL FORMAT</span></FLabel>
            <FFormStackPanel direction="vertical">
                <FFormStackPanel height={22} direction="horizontal">
                    <FBorder width={220} height={22} borderEdges={["left", "top"]}>
                        <FLabel fontSize="6" textAlignment="center">LATITUDE (Between 32.01 &amp; 35.22)</FLabel>
                    </FBorder>
                    <TextField field={section.getLatitude()} width={140} height={22} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.latitude, value)} />
                </FFormStackPanel>
                <FFormStackPanel height={22} direction="horizontal">
                    <FBorder width={220} height={22} borderEdges={["left", "top"]}>
                        <FLabel fontSize="6" textAlignment="center">LONGITUDE (Between -83.38 &amp; -78.5)</FLabel>
                    </FBorder>
                    <TextField field={section.getLongitude()} width={140} height={22} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.longitude, value)} />
                </FFormStackPanel>
            </FFormStackPanel>
        </FSection>
    );
};
