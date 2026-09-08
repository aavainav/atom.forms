import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { OffenseSectionModel } from "../../models/complaint-page/offense-section";
import { NumberBox, TextBox } from "../fields";

interface IOffenseSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OffenseSectionModel>;
}

/** Defines the offense notes and amount due of the Oklahoma City traffic citation form's complaint page. */
export const OffenseSection = ({ binding }: IOffenseSectionProps): React.JSX.Element => {
    const section = binding.get();
    const notes = section.getNotes();
    const dueDate = section.getDueDate();
    const amountDue = section.getAmountDue();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={notes} height={70} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.notes, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={dueDate} type="date" width={250} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dueDate, value)} />
                <NumberBox field={amountDue} width={170} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.amountDue, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
