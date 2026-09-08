import React from "react";
import { ISectionBinding, FFieldCheckbox, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { PrimaryReasonSectionModel } from "../../models/record-page/primary-reason-section";

interface IPrimaryReasonSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PrimaryReasonSectionModel>;
}

/** Defines the "Primary Reason for Contact" section (check only one) of the public contact/warning record. */
export const PrimaryReasonSection = ({ binding }: IPrimaryReasonSectionProps): React.JSX.Element => {
    const section = binding.get();
    const movingViolation = section.getMovingViolation();
    const nonMovingViolation = section.getNonMovingViolation();
    const motoristAssistance = section.getMotoristAssistance();
    const bolo = section.getBolo();
    const trafficCollision = section.getTrafficCollision();
    const suspiciousActivity = section.getSuspiciousActivity();
    const other = section.getOther();
    const otherSpecify = section.getOtherSpecify();

    return (
        <FSection>
            <div className="text-center">
                <h6 className="fw-bold mb-0">RECORD CONTACT</h6>
                <h6 className="fw-bold mb-0">PRIMARY REASON FOR CONTACT (CHECK ONLY ONE)</h6>
            </div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox id={movingViolation.id} label={movingViolation.label} type="radio" checked={movingViolation.getValue() as boolean} disabled={!movingViolation.getIsEnabled()} invalid={movingViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.movingViolation))} />
                        <FFieldCheckbox id={nonMovingViolation.id} label={nonMovingViolation.label} type="radio" checked={nonMovingViolation.getValue() as boolean} disabled={!nonMovingViolation.getIsEnabled()} invalid={nonMovingViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.nonMovingViolation))} />
                        <FFieldCheckbox id={motoristAssistance.id} label={motoristAssistance.label} type="radio" checked={motoristAssistance.getValue() as boolean} disabled={!motoristAssistance.getIsEnabled()} invalid={motoristAssistance.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.motoristAssistance))} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox id={bolo.id} label={bolo.label} type="radio" checked={bolo.getValue() as boolean} disabled={!bolo.getIsEnabled()} invalid={bolo.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.bolo))} />
                        <FFieldCheckbox id={trafficCollision.id} label={trafficCollision.label} type="radio" checked={trafficCollision.getValue() as boolean} disabled={!trafficCollision.getIsEnabled()} invalid={trafficCollision.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.trafficCollision))} />
                        <FFieldCheckbox id={suspiciousActivity.id} label={suspiciousActivity.label} type="radio" checked={suspiciousActivity.getValue() as boolean} disabled={!suspiciousActivity.getIsEnabled()} invalid={suspiciousActivity.getHasError()}
                            onChange={() => binding.update((current) => current.selectReason(current.suspiciousActivity))} />
                    </div>
                </div>
            </FFormStackPanel>
            <FFormStackPanel height={22} direction="horizontal">
                <FFieldCheckbox id={other.id} label={other.label} type="radio" checked={other.getValue() as boolean} disabled={!other.getIsEnabled()} invalid={other.getHasError()}
                    onChange={() => binding.update((current) => current.selectReason(current.other))} />
                    
                 <FFieldControl label={otherSpecify.label} labelFor={otherSpecify.id} borderEdges={["bottom"]}>
                    <FFieldInput
                        id={otherSpecify.id}
                        disabled={!otherSpecify.getIsEnabled() || other.getIsEmpty()}
                        invalid={otherSpecify.getHasError()}
                        value={otherSpecify.getValue()}
                        onChange={(value) => binding.setValue(section.otherSpecify, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
