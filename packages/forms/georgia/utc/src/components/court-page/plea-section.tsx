import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { PleaSectionModel } from "../../models/court-page/plea-section";
import { TextBox, twoDigitBoxWidth } from "../fields";

interface IPleaSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PleaSectionModel>;
}

/** Defines the "Appearance, Plea of Guilty and Waiver" block of the court's copy. */
export const PleaSection = ({ binding }: IPleaSectionProps): React.JSX.Element => {
    const section = binding.get();
    const accusedName = section.getAccusedName();
    const chargedWith = section.getChargedWith();
    const minimumMonths = section.getMinimumMonths();
    const minimumFine = section.getMinimumFine();
    const maximumMonths = section.getMaximumMonths();
    const maximumFine = section.getMaximumFine();
    const day = section.getDay();
    const month = section.getMonth();
    const year = section.getYear();
    const accusedSignature = section.getAccusedSignature();
    const judgeName = section.getJudgeName();
    const judgeSignature = section.getJudgeSignature();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">APPEARANCE, PLEA OF GUILTY AND WAIVER</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={accusedName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.accusedName, value)} /></div>
                <div className="w-100"><TextBox field={chargedWith} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.chargedWith, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={minimumMonths} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.minimumMonths, value)} /></div>
                <div className="w-100"><TextBox field={minimumFine} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.minimumFine, value)} /></div>
                <div className="w-100"><TextBox field={maximumMonths} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.maximumMonths, value)} /></div>
                <div className="w-100"><TextBox field={maximumFine} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.maximumFine, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <p className="small m-3">
                    I have been advised of my rights to be represented by counsel appointed to represent me if I am indigent, plead not
                    guilty and be tried by a jury or judge, confront the witnesses against me and not give incriminating evidence against
                    myself. I hereby waive these rights; state that I have not been induced by any threat or promise to enter this plea
                    and do freely and voluntarily enter my plea of Guilty.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <TextBox field={day} label="This (Day)" width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.day, value)} />
                <div className="w-100"><TextBox field={month} label="Day of (Month)" borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.month, value)} /></div>
                <TextBox field={year} width={twoDigitBoxWidth} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.year, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={accusedSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.accusedSignature, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <p className="small m-3">
                    I, the undersigned Judge of the MUNICIPAL COURT OF ATLANTA, have advised the above-named Accused as indicated above
                    of the rights and nature of the charges against him or her and the possible consequences of the plea as entered. I am
                    satisfied that there is a factual basis for the guilty plea which the Accused entered and that it was entered freely
                    and voluntarily with the understanding of the nature of the charge and the consequences of the plea, and a waiver of
                    a right to an attorney and a jury trial.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={judgeName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.judgeName, value)} /></div>
                <div className="w-100"><TextBox field={judgeSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.judgeSignature, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
