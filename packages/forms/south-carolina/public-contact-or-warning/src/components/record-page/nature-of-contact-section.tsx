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
                        <FFieldCheckbox id={speeding.id} label={speeding.label} type="radio" checked={speeding.getValue() as boolean} disabled={!speeding.getIsEnabled()} invalid={speeding.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.speeding))} />
                        <FFieldCheckbox id={contactOnly.id} label={contactOnly.label} type="radio" checked={contactOnly.getValue() as boolean} disabled={!contactOnly.getIsEnabled()} invalid={contactOnly.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.contactOnly))} />
                        <FFieldCheckbox id={improperLaneUse.id} label={improperLaneUse.label} type="radio" checked={improperLaneUse.getValue() as boolean} disabled={!improperLaneUse.getIsEnabled()} invalid={improperLaneUse.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.improperLaneUse))} />
                        <FFieldCheckbox id={failureToDimLights.id} label={failureToDimLights.label} type="radio" checked={failureToDimLights.getValue() as boolean} disabled={!failureToDimLights.getIsEnabled()} invalid={failureToDimLights.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.failureToDimLights))} />
                        <FFieldCheckbox id={improperBacking.id} label={improperBacking.label} type="radio" checked={improperBacking.getValue() as boolean} disabled={!improperBacking.getIsEnabled()} invalid={improperBacking.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.improperBacking))} />
                        <FFieldCheckbox id={improperLights.id} label={improperLights.label} type="radio" checked={improperLights.getValue() as boolean} disabled={!improperLights.getIsEnabled()} invalid={improperLights.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.improperLights))} />
                        <FFieldCheckbox id={improperTurn.id} label={improperTurn.label} type="radio" checked={improperTurn.getValue() as boolean} disabled={!improperTurn.getIsEnabled()} invalid={improperTurn.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.improperTurn))} />
                        <FFieldCheckbox id={disregardingStopSign.id} label={disregardingStopSign.label} type="radio" checked={disregardingStopSign.getValue() as boolean} disabled={!disregardingStopSign.getIsEnabled()} invalid={disregardingStopSign.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.disregardingStopSign))} />
                        <FFieldCheckbox id={seatBeltViolation.id} label={seatBeltViolation.label} type="radio" checked={seatBeltViolation.getValue() as boolean} disabled={!seatBeltViolation.getIsEnabled()} invalid={seatBeltViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.seatBeltViolation))} />
                        <FFieldCheckbox id={handsFreeViolation.id} label={handsFreeViolation.label} type="radio" checked={handsFreeViolation.getValue() as boolean} disabled={!handsFreeViolation.getIsEnabled()} invalid={handsFreeViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.handsFreeViolation))} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FFieldCheckbox id={disregardingTrafficSignal.id} label={disregardingTrafficSignal.label} type="radio" checked={disregardingTrafficSignal.getValue() as boolean} disabled={!disregardingTrafficSignal.getIsEnabled()} invalid={disregardingTrafficSignal.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.disregardingTrafficSignal))} />
                        <FFieldCheckbox id={followingTooClose.id} label={followingTooClose.label} type="radio" checked={followingTooClose.getValue() as boolean} disabled={!followingTooClose.getIsEnabled()} invalid={followingTooClose.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.followingTooClose))} />
                        <FFieldCheckbox id={changingLanesUnlawfully.id} label={changingLanesUnlawfully.label} type="radio" checked={changingLanesUnlawfully.getValue() as boolean} disabled={!changingLanesUnlawfully.getIsEnabled()} invalid={changingLanesUnlawfully.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.changingLanesUnlawfully))} />
                        <FFieldCheckbox id={noRightOfWay.id} label={noRightOfWay.label} type="radio" checked={noRightOfWay.getValue() as boolean} disabled={!noRightOfWay.getIsEnabled()} invalid={noRightOfWay.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.noRightOfWay))} />
                        <FFieldCheckbox id={defectiveEquipment.id} label={defectiveEquipment.label} type="radio" checked={defectiveEquipment.getValue() as boolean} disabled={!defectiveEquipment.getIsEnabled()} invalid={defectiveEquipment.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.defectiveEquipment))} />
                        <FFieldCheckbox id={improperPassing.id} label={improperPassing.label} type="radio" checked={improperPassing.getValue() as boolean} disabled={!improperPassing.getIsEnabled()} invalid={improperPassing.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.improperPassing))} />
                        <FFieldCheckbox id={driversLicenseViolation.id} label={driversLicenseViolation.label} type="radio" checked={driversLicenseViolation.getValue() as boolean} disabled={!driversLicenseViolation.getIsEnabled()} invalid={driversLicenseViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.driversLicenseViolation))} />
                        <FFieldCheckbox id={vehicleLicenseViolation.id} label={vehicleLicenseViolation.label} type="radio" checked={vehicleLicenseViolation.getValue() as boolean} disabled={!vehicleLicenseViolation.getIsEnabled()} invalid={vehicleLicenseViolation.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.vehicleLicenseViolation))} />
                        <FFieldCheckbox id={pedestrian.id} label={pedestrian.label} type="radio" checked={pedestrian.getValue() as boolean} disabled={!pedestrian.getIsEnabled()} invalid={pedestrian.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.pedestrian))} />
                        <FFieldCheckbox id={immigrationStop.id} label={immigrationStop.label} type="radio" checked={immigrationStop.getValue() as boolean} disabled={!immigrationStop.getIsEnabled()} invalid={immigrationStop.getHasError()}
                            onChange={() => binding.update((current) => current.selectNature(current.immigrationStop))} />

                        <FFormStackPanel height={22} direction="horizontal">
                            <FFieldCheckbox id={other.id} label={other.label} type="radio" checked={other.getValue() as boolean} disabled={!other.getIsEnabled()} invalid={other.getHasError()}
                                onChange={() => binding.update((current) => current.selectNature(current.other))} />
                                
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
                    </div>
                </div>
            </FFormStackPanel>
        </FSection>
    );
};
