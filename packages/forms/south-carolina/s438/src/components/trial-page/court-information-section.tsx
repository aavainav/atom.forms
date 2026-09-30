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
            <FBorder width={588} borderEdges={["left", "top", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">COURT INFORMATION</span></FLabel>
            </FBorder>
            <FBorder width={588} borderEdges={["left", "top", "right"]} contentJustify="evenly" contentAlignment="center">
                <FLabel fontSize="6">CASE BEFORE</FLabel>
                <CheckboxField field={section.getCaseBeforeMagistrate()} onChange={(checked) => binding.setValue(section.caseBeforeMagistrate, checked)} />
                <CheckboxField field={section.getCaseBeforeMunicipalCourt()} onChange={(checked) => binding.setValue(section.caseBeforeMunicipalCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeCircuitCourt()} onChange={(checked) => binding.setValue(section.caseBeforeCircuitCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeFamilyCourt()} onChange={(checked) => binding.setValue(section.caseBeforeFamilyCourt, checked)} />
                <CheckboxField field={section.getCaseBeforeFederalCourt()} onChange={(checked) => binding.setValue(section.caseBeforeFederalCourt, checked)} />
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getCourtIfDifferent()} width={588} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.courtIfDifferent, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FBorder width={294} borderEdges={["left", "top"]} contentJustify="evenly" contentAlignment="center">
                    <FLabel fontSize="6">TRIAL BY</FLabel>
                    <CheckboxField field={section.getTrialByJudge()} onChange={(checked) => binding.setValue(section.trialByJudge, checked)} />
                    <CheckboxField field={section.getTrialByJury()} onChange={(checked) => binding.setValue(section.trialByJury, checked)} />
                </FBorder>
                <FBorder width={294} borderEdges={["left", "top", "right"]} contentJustify="evenly" contentAlignment="center">
                    <FLabel fontSize="6">DEFENDANT</FLabel>
                    <CheckboxField field={section.getDefendantDidNotAppear()} onChange={(checked) => binding.setValue(section.defendantDidNotAppear, checked)} />
                    <CheckboxField field={section.getDefendantAppeared()} onChange={(checked) => binding.setValue(section.defendantAppeared, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getDispositionDate()} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dispositionDate, value)} />
                <FBorder width={380} borderEdges={["left", "top"]}>
                    <FLabel fontSize="6">DISPOSITION</FLabel>
                    <FBorder border="hidden" contentJustify="evenly">
                        <CheckboxField field={section.getNolleProssed()} onChange={(checked) => binding.setValue(section.nolleProssed, checked)} />
                        <CheckboxField field={section.getGuilty()} onChange={(checked) => binding.setValue(section.guilty, checked)} />
                        <CheckboxField field={section.getForfeitedBond()} onChange={(checked) => binding.setValue(section.forfeitedBond, checked)} />
                        <CheckboxField field={section.getNotGuilty()} onChange={(checked) => binding.setValue(section.notGuilty, checked)} />
                        <CheckboxField field={section.getPledNoloContendere()} onChange={(checked) => binding.setValue(section.pledNoloContendere, checked)} />
                    </FBorder>
                </FBorder>
                <FBorder width={98} borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getDeterminedBac()} onChange={(checked) => binding.setValue(section.determinedBac, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getChargeConvictedOf()} width={392} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.chargeConvictedOf, value)} />
                <FBorder width={110} borderEdges={["left", "top"]} contentAlignment="center">
                    <CheckboxField field={section.getSameAsOriginal()} onChange={(checked) => binding.setValue(section.sameAsOriginal, checked)} />
                </FBorder>
                <FNumberField field={section.getScPoints()} width={86} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.scPoints, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getJail()} width={70} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.jail, value)} />
                <FTextField field={section.getSuspend()} width={70} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.suspend, value)} />
                <FTextField field={section.getFine()} width={70} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.fine, value)} />
                <FTextField field={section.getAmountCollected()} width={90} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.amountCollected, value)} />
                <FTextField field={section.getAmountSuspended()} width={90} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.amountSuspended, value)} />
                <FTextField field={section.getCommittedTo()} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.committedTo, value)} />
                <FBorder width={88} borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getVehicleSearched()} onChange={(checked) => binding.setValue(section.vehicleSearched, checked)} />
                </FBorder>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FTextField field={section.getCertifiedCorrect()} width={294} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.certifiedCorrect, value)} />
                <FTextField field={section.getCertifiedDate()} width={176} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.certifiedDate, value)} />
                <FBorder width={118} borderEdges={["left", "top", "right"]} contentAlignment="center">
                    <CheckboxField field={section.getArrestResultOfCollision()} onChange={(checked) => binding.setValue(section.arrestResultOfCollision, checked)} />
                </FBorder>
            </FFormStackPanel>
        </FSection>
    );
}
