import React from "react";
import { FieldDefinition, ISectionBinding, StringFieldModel, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { ViolationsSectionModel } from "../../models/unit-page/violations-section";
import { TextField } from "../fields";

interface IViolationsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationsSectionModel>;
}

/** One of the two violation rows the form prints. */
interface IViolationRow {
    readonly charge: FieldDefinition<StringFieldModel>;
    readonly statuteNumber: FieldDefinition<StringFieldModel>;
    readonly ticketNumber: FieldDefinition<StringFieldModel>;
}

/** Defines the violations section of the TR-310 unit page; the form prints a fixed two rows. */
export const ViolationsSection = ({ binding }: IViolationsSectionProps): React.JSX.Element => {
    const section = binding.get();

    const rows: ReadonlyArray<IViolationRow> = [
        { statuteNumber: section.oneStatuteNumber, charge: section.oneCharge, ticketNumber: section.oneTicketNumber },
        { statuteNumber: section.twoStatuteNumber, charge: section.twoCharge, ticketNumber: section.twoTicketNumber }
    ];

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">VIOLATIONS</span></FLabel>
            {rows.map((row, index) => (
                <FFormStackPanel key={index} height={44} direction="horizontal">
                    <TextField field={section.get<StringFieldModel>(row.statuteNumber)} width={220} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.statuteNumber, value)} />
                    <TextField field={section.get<StringFieldModel>(row.charge)} width={420} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.charge, value)} />
                    <TextField field={section.get<StringFieldModel>(row.ticketNumber)} width={200} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(row.ticketNumber, value)} />
                </FFormStackPanel>
            ))}
        </FSection>
    );
};
