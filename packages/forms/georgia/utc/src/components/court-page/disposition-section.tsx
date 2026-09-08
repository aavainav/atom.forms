import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { DispositionSectionModel } from "../../models/court-page/disposition-section";
import { CheckBox, OptionBox, TextBox } from "../fields";

interface IDispositionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DispositionSectionModel>;
}

/** Defines the "Disposition and Sentence" block of the court's copy. */
export const DispositionSection = ({ binding }: IDispositionSectionProps): React.JSX.Element => {
    const section = binding.get();
    const fineAmount = section.getFineAmount();
    const daysInJail = section.getDaysInJail();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">DISPOSITION AND SENTENCE</div>
            <div className="text-center small">MUNICIPAL COURT OF ATLANTA</div>
            <FBorder border="visible">
                <FFormStackPanel direction="horizontal">
                    <div className="w-100 p-2">
                        <div className="small fw-bold">DEFENDANT PLEADS</div>
                        <OptionBox field={section.getPleadsGuilty()} onSelect={() => binding.update((current) => current.selectPleads(current.pleadsGuilty))} />
                        <OptionBox field={section.getPleadsNotGuilty()} onSelect={() => binding.update((current) => current.selectPleads(current.pleadsNotGuilty))} />
                        <OptionBox field={section.getPleadsNoloContendere()} onSelect={() => binding.update((current) => current.selectPleads(current.pleadsNoloContendere))} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">TRIAL</div>
                        <OptionBox field={section.getTrialJury()} onSelect={() => binding.update((current) => current.selectTrial(current.trialJury))} />
                        <OptionBox field={section.getTrialCourtAdjudicated()} onSelect={() => binding.update((current) => current.selectTrial(current.trialCourtAdjudicated))} />
                        <OptionBox field={section.getTrialGuilty()} onSelect={() => binding.update((current) => current.selectTrial(current.trialGuilty))} />
                        <OptionBox field={section.getTrialNotGuilty()} onSelect={() => binding.update((current) => current.selectTrial(current.trialNotGuilty))} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">OTHER ACTION</div>
                        <OptionBox field={section.getBondForfeiture()} onSelect={() => binding.update((current) => current.selectOtherAction(current.bondForfeiture))} />
                        <OptionBox field={section.getNolleProssed()} onSelect={() => binding.update((current) => current.selectOtherAction(current.nolleProssed))} />
                        <OptionBox field={section.getDeadDocket()} onSelect={() => binding.update((current) => current.selectOtherAction(current.deadDocket))} />
                    </div>
                </FFormStackPanel>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={fineAmount} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.fineAmount, value)} /></div>
                <div className="w-100"><TextBox field={daysInJail} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.daysInJail, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <div className="p-2">
                    <CheckBox field={section.getAlcoholDrugRiskReductionSchool()} onChange={(checked) => binding.setValue(section.alcoholDrugRiskReductionSchool, checked)} />
                    <CheckBox field={section.getAlcoholDrugAssessment()} onChange={(checked) => binding.setValue(section.alcoholDrugAssessment, checked)} />
                    <CheckBox field={section.getDefensiveDrivingSchool()} onChange={(checked) => binding.setValue(section.defensiveDrivingSchool, checked)} />
                </div>
            </FBorder>
        </FSection>
    );
};
