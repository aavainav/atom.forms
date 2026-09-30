import React from "react";
import { ISectionBinding, FCheckboxField, FFormStackPanel, FSection, FTextField } from "@forms/core";

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
                        <FCheckboxField field={speeding} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.speeding) })} />
                        <FCheckboxField field={contactOnly} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.contactOnly) })} />
                        <FCheckboxField field={improperLaneUse} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperLaneUse) })} />
                        <FCheckboxField field={failureToDimLights} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.failureToDimLights) })} />
                        <FCheckboxField field={improperBacking} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperBacking) })} />
                        <FCheckboxField field={improperLights} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperLights) })} />
                        <FCheckboxField field={improperTurn} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperTurn) })} />
                        <FCheckboxField field={disregardingStopSign} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.disregardingStopSign) })} />
                        <FCheckboxField field={seatBeltViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.seatBeltViolation) })} />
                        <FCheckboxField field={handsFreeViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.handsFreeViolation) })} />
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <FCheckboxField field={disregardingTrafficSignal} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.disregardingTrafficSignal) })} />
                        <FCheckboxField field={followingTooClose} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.followingTooClose) })} />
                        <FCheckboxField field={changingLanesUnlawfully} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.changingLanesUnlawfully) })} />
                        <FCheckboxField field={noRightOfWay} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.noRightOfWay) })} />
                        <FCheckboxField field={defectiveEquipment} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.defectiveEquipment) })} />
                        <FCheckboxField field={improperPassing} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.improperPassing) })} />
                        <FCheckboxField field={driversLicenseViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.driversLicenseViolation) })} />
                        <FCheckboxField field={vehicleLicenseViolation} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.vehicleLicenseViolation) })} />
                        <FCheckboxField field={pedestrian} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.pedestrian) })} />
                        <FCheckboxField field={immigrationStop} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectNature(current.immigrationStop) })} />

                        <FFormStackPanel direction="horizontal" height={22}>
                            <FCheckboxField field={other} type="radio"
                                onChange={() => binding.update({ update: (current) => current.selectNature(current.other) })} />

                            <FTextField
                                field={otherSpecify}
                                borderEdges={["bottom"]}
                                disabled={other.getIsEmpty()}
                                inputPadding={0}
                                onChange={(value) => binding.setValue(section.otherSpecify, value)}
                            />
                        </FFormStackPanel>
                    </div>
                </div>
            </FFormStackPanel>
        </FSection>
    );
};
