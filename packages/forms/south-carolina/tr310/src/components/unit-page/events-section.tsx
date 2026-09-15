import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { EventsSectionModel } from "../../models/unit-page/events-section";
import { ITR310Service } from "../../services";
import { CodeBox, CodeLegend, useOptions } from "../fields";

interface IEventsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<EventsSectionModel>;
}

/** Defines the most harmful event and sequence of events section of the TR-310 unit page; all five boxes share one printed legend. */
export const EventsSection = ({ binding }: IEventsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const load = useCallback(() => tr310Service.getSequenceOfEventsOptions(), [tr310Service]);
    const options = useOptions(load);

    const sequence = [
        { field: section.getSequenceFirst(), definition: section.sequenceFirst, label: "1st" },
        { field: section.getSequenceSecond(), definition: section.sequenceSecond, label: "2nd" },
        { field: section.getSequenceThird(), definition: section.sequenceThird, label: "3rd" },
        { field: section.getSequenceFourth(), definition: section.sequenceFourth, label: "4th" }
    ];

    return (
        <FSection>
            <FBorder borderEdges={["top", "left", "right"]}>
                <FFormStackPanel height={44} direction="horizontal">
                    <CodeBox
                        field={section.getMostHarmful()}
                        label={section.getMostHarmful().label}
                        load={load}
                        width={180}
                        borderEdges={["top", "right"]}
                        onChange={(value) => binding.setValue(section.mostHarmful, value)}
                    />
                    <FLabel fontSize="6"><span className="fw-bold">Sequence of Events</span></FLabel>
                    {sequence.map(({ field, definition, label }) => (
                        <CodeBox
                            key={field.id}
                            field={field}
                            label={label}
                            load={load}
                            borderEdges={["top", "left"]}
                            onChange={(value) => binding.setValue(definition, value)}
                        />
                    ))}
                </FFormStackPanel>
                <CodeLegend options={options} columns={4} />
            </FBorder>
        </FSection>
    );
};
