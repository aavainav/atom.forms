import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FSection } from "@forms/core";

import { HarmfulEventSectionModel } from "../../models/collision-page/harmful-event-section";
import { ITR310Service } from "../../services";
import { CodedField } from "../fields";

interface IHarmfulEventSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<HarmfulEventSectionModel>;
}

/** Defines the first harmful event section of the TR-310 - what first caused injury or damage, and where on the trafficway it happened. */
export const HarmfulEventSection = ({ binding }: IHarmfulEventSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadEventOptions = useCallback(() => tr310Service.getFirstHarmfulEventOptions(), [tr310Service]);
    const loadLocationOptions = useCallback(() => tr310Service.getFirstHarmfulEventLocationOptions(), [tr310Service]);

    return (
        <FSection>
            {/* forty-eight codes need the full width of the page, so the location sits beneath rather than beside */}
            <CodedField
                columns={3}
                field={section.getFirst()}
                load={loadEventOptions}
                title="First Harmful Event"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.first, value)}
            />
            <CodedField
                columns={3}
                field={section.getLocation()}
                load={loadLocationOptions}
                title="First Harmful Event Location"
                borderEdges={["top", "left", "right"]}
                onChange={(value) => binding.setValue(section.location, value)}
            />
        </FSection>
    );
};
