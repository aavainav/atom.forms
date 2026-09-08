import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { HeaderSectionModel } from "../../models/complaint-page/header-section";
import { TextBox } from "../fields";

interface IHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<HeaderSectionModel>;
}

/** Defines the header section of the Oklahoma City traffic citation form's complaint page. */
export const HeaderSection = ({ binding }: IHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();
    const citationNumber = section.getCitationNumber();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <TextBox field={citationNumber} width={280} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.citationNumber, value)} />
            </FFormStackPanel>
            <div className="text-center fw-bold mt-3">
                <div>COMPLAINT / INFORMATION</div>
                <div>IN THE MUNICIPAL COURT OF THE CITY OF OKLAHOMA CITY</div>
                <div>STATE OF OKLAHOMA</div>
                <div className="mt-2">THE CITY OF OKLAHOMA CITY VS</div>
            </div>
        </FSection>
    );
}
