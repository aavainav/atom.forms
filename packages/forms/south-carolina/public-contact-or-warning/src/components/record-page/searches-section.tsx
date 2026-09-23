import React from "react";
import { ISectionBinding, FFieldCheckbox, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { SearchesSectionModel } from "../../models/record-page/searches-section";

interface ISearchesSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<SearchesSectionModel>;
}

/** Defines the "Searches" section of the public contact/warning record. */
export const SearchesSection = ({ binding }: ISearchesSectionProps): React.JSX.Element => {
    const section = binding.get();
    const ofDriver = section.getOfDriver();
    const ofPedestrian = section.getOfPedestrian();
    const ofVehicle = section.getOfVehicle();
    const ofPassenger = section.getOfPassenger();

    const consentSearchRequested = section.getConsentSearchRequested();
    const consentSearchRequestedYes = section.getConsentSearchRequestedYes();
    const consentSearchRequestedNo = section.getConsentSearchRequestedNo();
    const consentGiven = section.getConsentGiven();
    const consentGivenYes = section.getConsentGivenYes();
    const consentGivenNo = section.getConsentGivenNo();

    const madeByConsent = section.getMadeByConsent();
    const incidentToArrest = section.getIncidentToArrest();
    const inventoryVehicleTowed = section.getInventoryVehicleTowed();
    const probableCause = section.getProbableCause();
    const basisOther = section.getBasisOther();
    const basisOtherSpecify = section.getBasisOtherSpecify();

    return (
        <FSection>
            <div className="text-center">
                <h6 className="fw-bold mb-0">SEARCHES (CHECK ALL THAT APPLY)</h6>
            </div>
            
            <FFormStackPanel direction="horizontal">
                <div className="w-100 ps-2">
                    <FFormStackPanel>
                        <FFormStackPanel direction="horizontal">
                            <div className="d-flex justify-content-evenly">
                                <FFieldCheckbox id={ofDriver.id} checked={ofDriver.getValue() as boolean} disabled={!ofDriver.getIsEnabled()} invalid={ofDriver.getHasError()} label={ofDriver.label}
                                    onChange={(checked) => binding.setValue(section.ofDriver, checked)} />
                                <FFieldCheckbox checked={ofPedestrian.getValue() as boolean} disabled={!ofPedestrian.getIsEnabled()} id={ofPedestrian.id} invalid={ofPedestrian.getHasError()} label={ofPedestrian.label}
                                    onChange={(checked) => binding.setValue(section.ofPedestrian, checked)} />
                            </div>
                        </FFormStackPanel>
                        <FFieldCheckbox id={consentSearchRequested.id} checked={consentSearchRequested.getValue() as boolean} disabled={!consentSearchRequested.getIsEnabled()} invalid={consentSearchRequested.getHasError()} label={consentSearchRequested.label}
                            onChange={(checked) => binding.update({ update: (current) => current.setConsentSearchRequested(checked) })} />
                        <FFieldCheckbox checked={consentGiven.getValue() as boolean} disabled={!consentGiven.getIsEnabled()} id={consentGiven.id} invalid={consentGiven.getHasError()} label={consentGiven.label}
                            onChange={(checked) => binding.update({ update: (current) => current.setConsentGiven(checked) })} />
                        <FFieldCheckbox checked={madeByConsent.getValue() as boolean} disabled={!madeByConsent.getIsEnabled()} id={madeByConsent.id} invalid={madeByConsent.getHasError()} label={madeByConsent.label}
                            onChange={(checked) => binding.setValue(section.madeByConsent, checked)} />
                        <FFieldCheckbox checked={incidentToArrest.getValue() as boolean} disabled={!incidentToArrest.getIsEnabled()} id={incidentToArrest.id} invalid={incidentToArrest.getHasError()} label={incidentToArrest.label}
                            onChange={(checked) => binding.setValue(section.incidentToArrest, checked)} />
                    </FFormStackPanel>
                </div>
                <div className="w-100 ps-2">
                    <FFormStackPanel direction="horizontal">
                        <FFieldCheckbox checked={ofVehicle.getValue() as boolean} disabled={!ofVehicle.getIsEnabled()} id={ofVehicle.id} invalid={ofVehicle.getHasError()} label={ofVehicle.label}
                            onChange={(checked) => binding.setValue(section.ofVehicle, checked)} />
                        <FFieldCheckbox checked={ofPassenger.getValue() as boolean} disabled={!ofPassenger.getIsEnabled()} id={ofPassenger.id} invalid={ofPassenger.getHasError()} label={ofPassenger.label}
                            onChange={(checked) => binding.setValue(section.ofPassenger, checked)} />
                    </FFormStackPanel>
                    <FFormStackPanel direction="horizontal">
                        <FFieldCheckbox id={consentSearchRequestedYes.id} checked={consentSearchRequestedYes.getValue() as boolean} disabled={!consentSearchRequestedYes.getIsEnabled()} invalid={consentSearchRequestedYes.getHasError()} label={consentSearchRequestedYes.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentRequested(current.consentSearchRequestedYes) })} />
                        <FFieldCheckbox checked={consentSearchRequestedNo.getValue() as boolean} disabled={!consentSearchRequestedNo.getIsEnabled()} id={consentSearchRequestedNo.id} invalid={consentSearchRequestedNo.getHasError()} label={consentSearchRequestedNo.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentRequested(current.consentSearchRequestedNo) })} />
                    </FFormStackPanel>
                    <FFormStackPanel direction="horizontal">
                        <FFieldCheckbox checked={consentGivenYes.getValue() as boolean} disabled={!consentGivenYes.getIsEnabled()} id={consentGivenYes.id} invalid={consentGivenYes.getHasError()} label={consentGivenYes.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentGiven(current.consentGivenYes) })} />
                        <FFieldCheckbox checked={consentGivenNo.getValue() as boolean} disabled={!consentGivenNo.getIsEnabled()} id={consentGivenNo.id} invalid={consentGivenNo.getHasError()} label={consentGivenNo.label} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentGiven(current.consentGivenNo) })} />
                    </FFormStackPanel>
                    <FFieldCheckbox checked={inventoryVehicleTowed.getValue() as boolean} disabled={!inventoryVehicleTowed.getIsEnabled()} id={inventoryVehicleTowed.id} invalid={inventoryVehicleTowed.getHasError()} label={inventoryVehicleTowed.label}
                        onChange={(checked) => binding.setValue(section.inventoryVehicleTowed, checked)} />
                    <FFieldCheckbox checked={probableCause.getValue() as boolean} disabled={!probableCause.getIsEnabled()} id={probableCause.id} invalid={probableCause.getHasError()} label={probableCause.label}
                        onChange={(checked) => binding.setValue(section.probableCause, checked)} />
                </div>
            </FFormStackPanel>
            <div className="ps-2">
                <FFormStackPanel direction="horizontal" height={22}>
                    <FFieldCheckbox checked={basisOther.getValue() as boolean} disabled={!basisOther.getIsEnabled()} id={basisOther.id} invalid={basisOther.getHasError()} label={basisOther.label}
                        onChange={(checked) => binding.setValue(section.basisOther, checked)} />

                    <div className="ps-2">
                        <FFieldControl borderEdges={["bottom"]} label={basisOtherSpecify.label} labelFor={basisOtherSpecify.id}>
                            <FFieldInput
                                disabled={!basisOtherSpecify.getIsEnabled() || basisOther.getIsEmpty()}
                                id={basisOtherSpecify.id}
                                invalid={basisOtherSpecify.getHasError()}
                                padding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                                value={basisOtherSpecify.getValue()}
                                onChange={(value) => binding.setValue(section.basisOtherSpecify, value)}
                            />
                        </FFieldControl>
                    </div>
                </FFormStackPanel>
            </div>
            
        </FSection>
    );
};
