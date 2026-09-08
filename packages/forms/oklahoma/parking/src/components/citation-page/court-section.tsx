import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { CourtSectionModel } from "../../models/citation-page/court-section";

interface ICourtSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CourtSectionModel>;
}

/**
 * Defines the court section of the Oklahoma City parking violation form's citation page.
 *
 * The court's name and address are preprinted on the form rather than filled in, so they are rendered as text
 * here and the section carries no field for them.
 */
export const CourtSection = ({ binding }: ICourtSectionProps): React.JSX.Element => {
    const section = binding.get();
    const date = section.getDate();
    const time = section.getTime();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={160} label={date.label} labelFor={date.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={date.id}
                        type="date"
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
                <FFieldControl width={160} label={time.label} labelFor={time.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={time.id}
                        disabled={!time.getIsEnabled()}
                        invalid={time.getHasError()}
                        value={time.getValue()}
                        onChange={(value) => binding.setValue(section.time, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <div className="text-center fw-bold mt-3">
                <div>OKLAHOMA CITY MUNICIPAL COURT</div>
                <div>701 COUCH DRIVE, OKLAHOMA CITY, OK 73102</div>
            </div>
        </FSection>
    );
}
