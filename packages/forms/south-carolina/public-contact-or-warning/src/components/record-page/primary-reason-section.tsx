import React from "react";
import { ISectionBinding, FCheckboxField, FFormStackPanel, FSection, FTextField } from "@forms/core";

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
                        <FCheckboxField field={movingViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.movingViolation) })} />
                        <FCheckboxField field={nonMovingViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.nonMovingViolation) })} />
                        <FCheckboxField field={motoristAssistance} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.motoristAssistance) })} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FCheckboxField field={bolo} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.bolo) })} />
                        <FCheckboxField field={trafficCollision} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.trafficCollision) })} />
                        <FCheckboxField field={suspiciousActivity} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectReason(current.suspiciousActivity) })} />
                    </div>
                </div>
            </FFormStackPanel>
            <div className="ps-2">
                <FFormStackPanel direction="horizontal" height={22}>
                    <FCheckboxField field={other} type="radio"
                        onChange={() => binding.update({ update: (current) => current.selectReason(current.other) })} />

                    <div className="ps-2">
                        <FTextField
                            field={otherSpecify}
                            borderEdges={["bottom"]}
                            disabled={other.getIsEmpty()}
                            inputPadding={0}
                            onChange={(value) => binding.setValue(section.otherSpecify, value)}
                        />
                    </div>
                </FFormStackPanel>
            </div>
        </FSection>
    );
};
