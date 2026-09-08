import React from "react";
import { ISectionBinding, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { RouteSectionModel } from "../../models/collision-page/route-section";
import { TextField } from "../fields";

interface IRouteSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RouteSectionModel>;
}

/** Defines the on-route section of the TR-310 - the route the collision occurred on, the lane, and the offset from the base intersection. */
export const RouteSection = ({ binding }: IRouteSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">ON ROUTE CATEGORY / COLLISION LOCATION</span></FLabel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getCategory()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.category, value)} />
                <TextField field={section.getAuxiliary()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.auxiliary, value)} />
                <TextField field={section.getNumber()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.number, value)} />
                <TextField field={section.getRouteName()} width={320} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.routeName, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getRailroadId()} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.railroadId, value)} />
                <TextField field={section.getLaneNumber()} width={70} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.laneNumber, value)} />
                <TextField field={section.getLaneCount()} width={70} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.laneCount, value)} />
                <TextField field={section.getDistanceOffsetMiles()} width={90} label="Distance Offset - Miles" borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.distanceOffsetMiles, value)} />
                <TextField field={section.getDistanceOffsetFeet()} width={90} label="Distance Offset - Feet" borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.distanceOffsetFeet, value)} />
                <TextField field={section.getDirection()} width={90} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.direction, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
