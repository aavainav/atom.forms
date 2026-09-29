import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FLabel, FNumberField, FSection, FTextField } from "@forms/core";

import { TrialCourtInformationSectionModel } from "../../models/trial-page/court-information-section";
import CheckboxField from "./checkbox-field";

interface ITrialCourtInformationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<TrialCourtInformationSectionModel>;
}

/** Defines the court information section for the trial page of the S438 citation form: the court the case went before, how it was tried, the disposition and the sentence. */
export default function TrialCourtInformationSection({ binding }: ITrialCourtInformationSectionProps): React.JSX.Element {
    const section = binding.get();

    return (
        <FSection>
            <FBorder borderEdges={["left", "top", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">COURT INFORMATION</span></FLabel>
            </FBorder>
            <FBorder borderEdges={["left", "top", "right"]} contentJustify="evenly" contentAlignment="center">
                <FLabel fontSize="6">CASE BEFORE</FLabel>
                <CheckboxField field={section.getCaseBeforeMagistrate()} onChange={(checked) => binding.setValue(section.caseBeforeMagistrate, checked)} />
                <CheckboxField field={section.getCaseBeforeMunicipalCourt()} onChange={(checked) => binding.setValue(section.caseBeforeMunicipalCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeCircuitCourt()} onChange={(checked) => binding.setValue(section.caseBeforeCircuitCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeFamilyCourt()} onChange={(checked) => binding.setValue(section.caseBeforeFamilyCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeFederalCourt()} onChange={(checked) => binding.setValue(section.caseBeforeFederalCourt, checked)} />
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getCourtIfDifferent()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.courtIfDifferent, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FBorder borderEdges={["left", "top"]} contentJustify="evenly" contentAlignment="center">
                        <FLabel fontSize="6">TRIAL BY</FLabel>
                        <CheckboxField field={section.getTrialByJudge()} onChange={(checked) => binding.setValue(section.trialByJudge, checked)} />
                        <CheckboxField field={section.getTrialByJury()} onChange={(checked) => binding.setValue(section.trialByJury, checked)} />
                    </FBorder>
                </div>
                <div className="w-100">
                    <FBorder borderEdges={["left", "top", "right"]} contentJustify="evenly" contentAlignment="center">
                        <FLabel fontSize="6">DEFENDANT</FLabel>
                        <CheckboxField field={section.getDefendantDidNotAppear()} onChange={(checked) => binding.setValue(section.defendantDidNotAppear, checked)} />
                        <CheckboxField field={section.getDefendantAppeared()} onChange={(checked) => binding.setValue(section.defendantAppeared, checked)} />
                    </FBorder>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-25">
                    <FTextField field={section.getDispositionDate()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dispositionDate, value)} />
                </div>
                <div className="w-100">
                    <FBorder borderEdges={["left", "top"]}>
                        <FLabel fontSize="6">DISPOSITION</FLabel>
                        <FBorder border="hidden" contentJustify="evenly">
                            <CheckboxField field={section.getNolleProssed()} onChange={(checked) => binding.setValue(section.nolleProssed, checked)} />
                            <CheckboxField field={section.getGuilty()} onChange={(checked) => binding.setValue(section.guilty, checked)} />
                            <CheckboxField field={section.getForfeitedBond()} onChange={(checked) => binding.setValue(section.forfeitedBond, checked)} />
                            <CheckboxField field={section.getNotGuilty()} onChange={(checked) => binding.setValue(section.notGuilty, checked)} />
                            <CheckboxField field={section.getPledNoloContendere()} onChange={(checked) => binding.setValue(section.pledNoloContendere, checked)} />
                        </FBorder>
                    </FBorder>
                </div>
                <FBorder borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getDeterminedBac()} onChange={(checked) => binding.setValue(section.determinedBac, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getChargeConvictedOf()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.chargeConvictedOf, value)} />
                </div>
                <FBorder borderEdges={["left", "top"]} contentAlignment="center">
                    <CheckboxField field={section.getSameAsOriginal()} onChange={(checked) => binding.setValue(section.sameAsOriginal, checked)} />
                </FBorder>
                <div className="w-25">
                    <FNumberField field={section.getScPoints()} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.scPoints, value)} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getJail()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.jail, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getSuspend()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.suspend, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getFine()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.fine, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getAmountCollected()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.amountCollected, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getAmountSuspended()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.amountSuspended, value)} />
                </div>
                <div className="w-100">
                    <FTextField field={section.getCommittedTo()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.committedTo, value)} />
                </div>
                <FBorder borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getVehicleSearched()} onChange={(checked) => binding.setValue(section.vehicleSearched, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FTextField field={section.getCertifiedCorrect()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.certifiedCorrect, value)} />
                </div>
                <div className="w-50">
                    <FTextField field={section.getCertifiedDate()} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.certifiedDate, value)} />
                </div>
                <FBorder borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getArrestResultOfCollision()} onChange={(checked) => binding.setValue(section.arrestResultOfCollision, checked)} />
                </FBorder>
            </FFormStackPanel>
        </FSection>
    );
}
