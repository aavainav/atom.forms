import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { OffenseSectionModel } from "../../models/citation-page/offense-section";
import { OptionBox, TextBox } from "../fields";

interface IOffenseSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OffenseSectionModel>;
}

/** Defines the offense, companion case and remarks boxes of Section II. */
export const OffenseSection = ({ binding }: IOffenseSectionProps): React.JSX.Element => {
    const section = binding.get();
    const description = section.getDescription();
    const codeSection = section.getCodeSection();
    const stateLaw = section.getStateLaw();
    const localOrdinance = section.getLocalOrdinance();
    const companionCaseYes = section.getCompanionCaseYes();
    const companionCaseNo = section.getCompanionCaseNo();
    const companionCitation = section.getCompanionCitation();
    const remarks = section.getRemarks();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={description} height={80} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.description, value)} /></div>
                <div className="w-100"><TextBox field={codeSection} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.codeSection, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <div className="p-2">
                    <OptionBox field={stateLaw} onSelect={() => binding.update((current) => current.selectAuthority(current.stateLaw))} />
                    <OptionBox field={localOrdinance} onSelect={() => binding.update((current) => current.selectAuthority(current.localOrdinance))} />
                </div>
            </FBorder>
            <FBorder border="visible">
                <div className="p-2">
                    <span className="small fw-bold me-2">COMPANION CASE</span>
                    <OptionBox field={companionCaseYes} onSelect={() => binding.update((current) => current.selectCompanionCase(current.companionCaseYes))} />
                    <OptionBox field={companionCaseNo} onSelect={() => binding.update((current) => current.selectCompanionCase(current.companionCaseNo))} />
                </div>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={companionCitation} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.companionCitation, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={remarks} height={60} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.remarks, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
