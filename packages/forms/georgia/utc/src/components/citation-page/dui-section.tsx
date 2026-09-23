import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { DuiSectionModel } from "../../models/citation-page/dui-section";
import { CheckBox, OptionBox, TextBox } from "../fields";

interface IDuiSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DuiSectionModel>;
}

/** Defines the DUI boxes of Section II of the Georgia uniform traffic citation. */
export const DuiSection = ({ binding }: IDuiSectionProps): React.JSX.Element => {
    const section = binding.get();
    const charged = section.getCharged();
    const testBlood = section.getTestBlood();
    const testBreath = section.getTestBreath();
    const testUrine = section.getTestUrine();
    const testOther = section.getTestOther();
    const testResults = section.getTestResults();
    const testAdministeredBy = section.getTestAdministeredBy();

    return (
        <FSection>
            <FBorder border="visible">
                <div className="p-2">
                    <CheckBox field={charged} onChange={(checked) => binding.setValue(section.charged, checked)} />
                    <span className="small ms-2 me-2">Test Administered:</span>
                    <OptionBox field={testBlood} onSelect={() => binding.update({ update: (current) => current.selectTestAdministered(current.testBlood) })} />
                    <OptionBox field={testBreath} onSelect={() => binding.update({ update: (current) => current.selectTestAdministered(current.testBreath) })} />
                    <OptionBox field={testUrine} onSelect={() => binding.update({ update: (current) => current.selectTestAdministered(current.testUrine) })} />
                    <OptionBox field={testOther} onSelect={() => binding.update({ update: (current) => current.selectTestAdministered(current.testOther) })} />
                </div>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={testResults} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.testResults, value)} /></div>
                <div className="w-100"><TextBox field={testAdministeredBy} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.testAdministeredBy, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
