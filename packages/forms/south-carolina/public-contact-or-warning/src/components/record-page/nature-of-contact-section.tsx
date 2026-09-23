import React from "react";
import { ISectionBinding, FFieldCheckbox, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { NatureOfContactSectionModel } from "../../models/record-page/nature-of-contact-section";

interface INatureOfContactSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<NatureOfContactSectionModel>;
}

/** Defines the "Nature of Contact" section (check only one) of the public contact/warning record. */
export const NatureOfContactSection = ({ binding }: INatureOfContactSectionProps): React.JSX.Element => {
    const section = binding.get();
    const speeding = section.getSpeeding();
    const contactOnly = section.getContactOnly();
    const improperLaneUse = section.getImproperLaneUse();
    const failureToDimLights = section.getFailureToDimLights();
    const improperBacking = section.getImproperBacking();
    const improperLights = section.getImproperLights();
    const improperTurn = section.getImproperTurn();
    const disregardingStopSign = section.getDisregardingStopSign();
    const seatBeltViolation = section.getSeatBeltViolation();
    const handsFreeViolation = section.getHandsFreeViolation();
    const disregardingTrafficSignal = section.getDisregardingTrafficSignal();
    const followingTooClose = section.getFollowingTooClose();
    const changingLanesUnlawfully = section.getChangingLanesUnlawfully();
    const noRightOfWay = section.getNoRightOfWay();
    const defectiveEquipment = section.getDefectiveEquipment();
    const improperPassing = section.getImproperPassing();
    const driversLicenseViolation = section.getDriversLicenseViolation();
    const vehicleLicenseViolation = section.getVehicleLicenseViolation();
    const pedestrian = section.getPedestrian();
    const immigrationStop = section.getImmigrationStop();
    const other = section.getOther();
    const otherSpecify = section.getOtherSpecify();

    return (
        <FSection>
            <div className="text-center">
                <h6 className="fw-bold mt-4 mb-0">NATURE OF CONTACT (CHECK ONLY ONE)</h6>
            </div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox id={speeding.id} checked={speeding.getValue() as boolean} disabled={!speeding.getIsEnabled()} invalid={speeding.getHasError()} label={speeding.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.speeding) })} />
                        <FFieldCheckbox checked={contactOnly.getValue() as boolean} disabled={!contactOnly.getIsEnabled()} id={contactOnly.id} invalid={contactOnly.getHasError()} label={contactOnly.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.contactOnly) })} />
                        <FFieldCheckbox checked={improperLaneUse.getValue() as boolean} disabled={!improperLaneUse.getIsEnabled()} id={improperLaneUse.id} invalid={improperLaneUse.getHasError()} label={improperLaneUse.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperLaneUse) })} />
                        <FFieldCheckbox checked={failureToDimLights.getValue() as boolean} disabled={!failureToDimLights.getIsEnabled()} id={failureToDimLights.id} invalid={failureToDimLights.getHasError()} label={failureToDimLights.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.failureToDimLights) })} />
                        <FFieldCheckbox checked={improperBacking.getValue() as boolean} disabled={!improperBacking.getIsEnabled()} id={improperBacking.id} invalid={improperBacking.getHasError()} label={improperBacking.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperBacking) })} />
                        <FFieldCheckbox checked={improperLights.getValue() as boolean} disabled={!improperLights.getIsEnabled()} id={improperLights.id} invalid={improperLights.getHasError()} label={improperLights.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperLights) })} />
                        <FFieldCheckbox checked={improperTurn.getValue() as boolean} disabled={!improperTurn.getIsEnabled()} id={improperTurn.id} invalid={improperTurn.getHasError()} label={improperTurn.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperTurn) })} />
                        <FFieldCheckbox checked={disregardingStopSign.getValue() as boolean} disabled={!disregardingStopSign.getIsEnabled()} id={disregardingStopSign.id} invalid={disregardingStopSign.getHasError()} label={disregardingStopSign.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.disregardingStopSign) })} />
                        <FFieldCheckbox checked={seatBeltViolation.getValue() as boolean} disabled={!seatBeltViolation.getIsEnabled()} id={seatBeltViolation.id} invalid={seatBeltViolation.getHasError()} label={seatBeltViolation.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.seatBeltViolation) })} />
                        <FFieldCheckbox checked={handsFreeViolation.getValue() as boolean} disabled={!handsFreeViolation.getIsEnabled()} id={handsFreeViolation.id} invalid={handsFreeViolation.getHasError()} label={handsFreeViolation.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.handsFreeViolation) })} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox checked={disregardingTrafficSignal.getValue() as boolean} disabled={!disregardingTrafficSignal.getIsEnabled()} id={disregardingTrafficSignal.id} invalid={disregardingTrafficSignal.getHasError()} label={disregardingTrafficSignal.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.disregardingTrafficSignal) })} />
                        <FFieldCheckbox checked={followingTooClose.getValue() as boolean} disabled={!followingTooClose.getIsEnabled()} id={followingTooClose.id} invalid={followingTooClose.getHasError()} label={followingTooClose.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.followingTooClose) })} />
                        <FFieldCheckbox checked={changingLanesUnlawfully.getValue() as boolean} disabled={!changingLanesUnlawfully.getIsEnabled()} id={changingLanesUnlawfully.id} invalid={changingLanesUnlawfully.getHasError()} label={changingLanesUnlawfully.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.changingLanesUnlawfully) })} />
                        <FFieldCheckbox checked={noRightOfWay.getValue() as boolean} disabled={!noRightOfWay.getIsEnabled()} id={noRightOfWay.id} invalid={noRightOfWay.getHasError()} label={noRightOfWay.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.noRightOfWay) })} />
                        <FFieldCheckbox checked={defectiveEquipment.getValue() as boolean} disabled={!defectiveEquipment.getIsEnabled()} id={defectiveEquipment.id} invalid={defectiveEquipment.getHasError()} label={defectiveEquipment.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.defectiveEquipment) })} />
                        <FFieldCheckbox checked={improperPassing.getValue() as boolean} disabled={!improperPassing.getIsEnabled()} id={improperPassing.id} invalid={improperPassing.getHasError()} label={improperPassing.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperPassing) })} />
                        <FFieldCheckbox checked={driversLicenseViolation.getValue() as boolean} disabled={!driversLicenseViolation.getIsEnabled()} id={driversLicenseViolation.id} invalid={driversLicenseViolation.getHasError()} label={driversLicenseViolation.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.driversLicenseViolation) })} />
                        <FFieldCheckbox checked={vehicleLicenseViolation.getValue() as boolean} disabled={!vehicleLicenseViolation.getIsEnabled()} id={vehicleLicenseViolation.id} invalid={vehicleLicenseViolation.getHasError()} label={vehicleLicenseViolation.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.vehicleLicenseViolation) })} />
                        <FFieldCheckbox checked={pedestrian.getValue() as boolean} disabled={!pedestrian.getIsEnabled()} id={pedestrian.id} invalid={pedestrian.getHasError()} label={pedestrian.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.pedestrian) })} />
                        <FFieldCheckbox checked={immigrationStop.getValue() as boolean} disabled={!immigrationStop.getIsEnabled()} id={immigrationStop.id} invalid={immigrationStop.getHasError()} label={immigrationStop.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.immigrationStop) })} />

                        <FFormStackPanel direction="horizontal" height={22}>
                            <FFieldCheckbox checked={other.getValue() as boolean} disabled={!other.getIsEnabled()} id={other.id} invalid={other.getHasError()} label={other.label} type="radio"
                                onChange={() => binding.update({ update: (current) => current.selectNature(current.other) })} />

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
                    </div>
                </div>
            </FFormStackPanel>
        </FSection>
    );
};
