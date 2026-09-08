import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { SwornSectionModel } from "../../models/complaint-page/sworn-section";
import { TextBox } from "../fields";

interface ISwornSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<SwornSectionModel>;
}

/** Defines the jurat of the Oklahoma City traffic citation form's complaint page. */
export const SwornSection = ({ binding }: ISwornSectionProps): React.JSX.Element => {
    const section = binding.get();
    const swornName = section.getSwornName();
    const date = section.getDate();
    const title = section.getTitle();

    return (
        <FSection>
            <div className="small mt-3">SUBSCRIBED AND SWORN BEFORE ME:</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={swornName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.swornName, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={date} type="date" width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.date, value)} />
                <div className="w-100"><TextBox field={title} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.title, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
}
