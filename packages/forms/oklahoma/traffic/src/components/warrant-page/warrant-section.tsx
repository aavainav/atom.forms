import React from "react";
import { ISectionBinding, FBorder, FFieldCheckbox, FFormStackPanel, FSection } from "@forms/core";

import { WarrantSectionModel } from "../../models/warrant-page/warrant-section";
import { TextBox } from "../fields";

interface IWarrantSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<WarrantSectionModel>;
}

/** Defines the warrant recommendation section of the Oklahoma City traffic citation form's warrant page. */
export const WarrantSection = ({ binding }: IWarrantSectionProps): React.JSX.Element => {
    const section = binding.get();
    const approved = section.getApproved();
    const counselor = section.getCounselor();

    return (
        <FSection>
            <FBorder border="visible">
                <p className="small m-3">I have examined the facts in this case and recommend that a warrant be issued.</p>
                <div className="p-2">
                    <FFieldCheckbox
                        id={approved.id}
                        label={approved.label}
                        checked={approved.getValue() as boolean}
                        disabled={!approved.getIsEnabled()}
                        invalid={approved.getHasError()}
                        onChange={(checked) => binding.setValue(section.approved, checked)}
                    />
                </div>
                <FFormStackPanel direction="horizontal">
                    <div className="w-100"><TextBox field={counselor} borderEdges={["top"]} onChange={(value) => binding.setValue(section.counselor, value)} /></div>
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
}
