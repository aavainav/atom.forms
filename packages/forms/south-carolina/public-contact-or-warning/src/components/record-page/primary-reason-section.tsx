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
                        <FFieldCheckbox id={movingViolation.id} checked={movingViolation.getValue() as boolean} disabled={!movingViolation.getIsEnabled()} invalid={movingViolation.getHasError()} label={movingViolation.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.movingViolation))} />
                        <FFieldCheckbox checked={nonMovingViolation.getValue() as boolean} disabled={!nonMovingViolation.getIsEnabled()} id={nonMovingViolation.id} invalid={nonMovingViolation.getHasError()} label={nonMovingViolation.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.nonMovingViolation))} />
                        <FFieldCheckbox checked={motoristAssistance.getValue() as boolean} disabled={!motoristAssistance.getIsEnabled()} id={motoristAssistance.id} invalid={motoristAssistance.getHasError()} label={motoristAssistance.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.motoristAssistance))} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox checked={bolo.getValue() as boolean} disabled={!bolo.getIsEnabled()} id={bolo.id} invalid={bolo.getHasError()} label={bolo.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.bolo))} />
                        <FFieldCheckbox checked={trafficCollision.getValue() as boolean} disabled={!trafficCollision.getIsEnabled()} id={trafficCollision.id} invalid={trafficCollision.getHasError()} label={trafficCollision.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.trafficCollision))} />
                        <FFieldCheckbox checked={suspiciousActivity.getValue() as boolean} disabled={!suspiciousActivity.getIsEnabled()} id={suspiciousActivity.id} invalid={suspiciousActivity.getHasError()} label={suspiciousActivity.label} type="radio"
                            onChange={() => binding.update((current) => current.selectReason(current.suspiciousActivity))} />
                    </div>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal" height={22}>
                <FFieldCheckbox checked={other.getValue() as boolean} disabled={!other.getIsEnabled()} id={other.id} invalid={other.getHasError()} label={other.label} type="radio"
                    onChange={() => binding.update((current) => current.selectReason(current.other))} />

                 <FFieldControl borderEdges={["bottom"]} label={otherSpecify.label} labelFor={otherSpecify.id}>
                    <FFieldInput
                        disabled={!otherSpecify.getIsEnabled() || other.getIsEmpty()}
                        id={otherSpecify.id}
                        invalid={otherSpecify.getHasError()}
                        padding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                        value={otherSpecify.getValue()}
                        onChange={(value) => binding.setValue(section.otherSpecify, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
