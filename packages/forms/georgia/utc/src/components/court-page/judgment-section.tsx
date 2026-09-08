import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { JudgmentSectionModel } from "../../models/court-page/judgment-section";
import { TextBox } from "../fields";

interface IJudgmentSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<JudgmentSectionModel>;
}

/** Defines the "Upon Trial, the Defendant is Adjudged" block at the foot of the court's copy. */
export const JudgmentSection = ({ binding }: IJudgmentSectionProps): React.JSX.Element => {
    const section = binding.get();
    const fineAmount = section.getFineAmount();
    const confinementTerm = section.getConfinementTerm();
    const date = section.getDate();
    const judgeSignature = section.getJudgeSignature();
    const appealBond = section.getAppealBond();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">UPON TRIAL, THE DEFENDANT IS ADJUDGED</div>
            <FBorder border="visible">
                <p className="small m-3">
                    It is considered, ordered and adjusted that the defendant pay a fine, PLUS all statutory assessments and surcharges,
                    and (in default of such payment) be confined for a term (in the FULTON COUNTY Public Works, as the State Director of
                    Corrections may direct) (in the City Prison). The confinement specified shall be suspended on payment of the fine and
                    on further condition that the defendant does not again violate the laws of Georgia.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={fineAmount} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.fineAmount, value)} /></div>
                <div className="w-100"><TextBox field={confinementTerm} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.confinementTerm, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <p className="small m-3">
                    As provided by law, I hereby certify that the information on this accusation is a true abstract of the record of this
                    court in this case.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={date} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.date, value)} /></div>
                <div className="w-100"><TextBox field={judgeSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.judgeSignature, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={appealBond} label="Appeal Bond of $ (Dollars)" borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.appealBond, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
