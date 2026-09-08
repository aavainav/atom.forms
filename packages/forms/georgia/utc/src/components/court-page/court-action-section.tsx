import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { CourtActionSectionModel } from "../../models/court-page/court-action-section";
import { TextBox } from "../fields";

interface ICourtActionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CourtActionSectionModel>;
}

/** Defines the "Court Action and Other Orders" block at the head of the court's copy. */
export const CourtActionSection = ({ binding }: ICourtActionSectionProps): React.JSX.Element => {
    const section = binding.get();
    const date = section.getDate();
    const complaintFiled = section.getComplaintFiled();
    const bailFixed = section.getBailFixed();
    const cashDeposit = section.getCashDeposit();
    const bailTakenBySignature = section.getBailTakenBySignature();
    const bailGivenBySignature = section.getBailGivenBySignature();
    const fineAmount = section.getFineAmount();
    const clerkSignature = section.getClerkSignature();
    const firstContinuance = section.getFirstContinuance();
    const firstContinuanceReason = section.getFirstContinuanceReason();
    const secondContinuance = section.getSecondContinuance();
    const secondContinuanceReason = section.getSecondContinuanceReason();
    const warrantIssued = section.getWarrantIssued();
    const warrantServed = section.getWarrantServed();
    const waivesTrialByJury = section.getWaivesTrialByJury();
    const arraignmentPlea = section.getArraignmentPlea();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">COURT ACTION AND OTHER ORDERS</div>
            <FBorder border="visible">
                <p className="small m-3">
                    The within complaint has been examined and there is probable cause for filing the same. Leave is hereby granted to
                    file the complaint.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={date} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.date, value)} /></div>
                <div className="w-100"><TextBox field={complaintFiled} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.complaintFiled, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={bailFixed} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.bailFixed, value)} /></div>
                <div className="w-100"><TextBox field={cashDeposit} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.cashDeposit, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={bailTakenBySignature} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.bailTakenBySignature, value)} /></div>
                <div className="w-100"><TextBox field={bailGivenBySignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bailGivenBySignature, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={fineAmount} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.fineAmount, value)} /></div>
                <div className="w-100"><TextBox field={clerkSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.clerkSignature, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={firstContinuance} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstContinuance, value)} /></div>
                <div className="w-100"><TextBox field={firstContinuanceReason} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.firstContinuanceReason, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={secondContinuance} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondContinuance, value)} /></div>
                <div className="w-100"><TextBox field={secondContinuanceReason} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.secondContinuanceReason, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={warrantIssued} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.warrantIssued, value)} /></div>
                <div className="w-100"><TextBox field={warrantServed} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.warrantServed, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={waivesTrialByJury} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.waivesTrialByJury, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={arraignmentPlea} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.arraignmentPlea, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
