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

    const consentRequestedYes = section.getConsentRequestedYes();
    const consentRequestedNo = section.getConsentRequestedNo();
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
                <FFieldCheckbox id={ofDriver.id} label={ofDriver.label} checked={ofDriver.getValue() as boolean} disabled={!ofDriver.getIsEnabled()} invalid={ofDriver.getHasError()}
                    onChange={(checked) => binding.setValue(section.ofDriver, checked)} />
                <FFieldCheckbox id={ofPedestrian.id} label={ofPedestrian.label} checked={ofPedestrian.getValue() as boolean} disabled={!ofPedestrian.getIsEnabled()} invalid={ofPedestrian.getHasError()}
                    onChange={(checked) => binding.setValue(section.ofPedestrian, checked)} />
                <FFieldCheckbox id={ofVehicle.id} label={ofVehicle.label} checked={ofVehicle.getValue() as boolean} disabled={!ofVehicle.getIsEnabled()} invalid={ofVehicle.getHasError()}
                    onChange={(checked) => binding.setValue(section.ofVehicle, checked)} />
                <FFieldCheckbox id={ofPassenger.id} label={ofPassenger.label} checked={ofPassenger.getValue() as boolean} disabled={!ofPassenger.getIsEnabled()} invalid={ofPassenger.getHasError()}
                    onChange={(checked) => binding.setValue(section.ofPassenger, checked)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <div className="p-2">
                        <div className="d-flex justify-content-evenly">
                            <FFieldCheckbox id={consentRequestedYes.id} label={consentRequestedYes.label} type="radio" checked={consentRequestedYes.getValue() as boolean} disabled={!consentRequestedYes.getIsEnabled()} invalid={consentRequestedYes.getHasError()}
                                onChange={() => binding.update((current) => current.selectConsentRequested(current.consentRequestedYes))} />
                            <FFieldCheckbox id={consentRequestedNo.id} label={consentRequestedNo.label} type="radio" checked={consentRequestedNo.getValue() as boolean} disabled={!consentRequestedNo.getIsEnabled()} invalid={consentRequestedNo.getHasError()}
                                onChange={() => binding.update((current) => current.selectConsentRequested(current.consentRequestedNo))} />
                        </div>
                    </div>
                </div>
                <div className="w-100">
                    <div className="p-2">
                        <div className="d-flex justify-content-evenly">
                            <FFieldCheckbox id={consentGivenYes.id} label={consentGivenYes.label} type="radio" checked={consentGivenYes.getValue() as boolean} disabled={!consentGivenYes.getIsEnabled()} invalid={consentGivenYes.getHasError()}
                                onChange={() => binding.update((current) => current.selectConsentGiven(current.consentGivenYes))} />
                            <FFieldCheckbox id={consentGivenNo.id} label={consentGivenNo.label} type="radio" checked={consentGivenNo.getValue() as boolean} disabled={!consentGivenNo.getIsEnabled()} invalid={consentGivenNo.getHasError()}
                                onChange={() => binding.update((current) => current.selectConsentGiven(current.consentGivenNo))} />
                        </div>
                    </div>
                </div>
            </FFormStackPanel>
            <div className="d-flex justify-content-evenly p-2">
                <FFieldCheckbox id={madeByConsent.id} label={madeByConsent.label} checked={madeByConsent.getValue() as boolean} disabled={!madeByConsent.getIsEnabled()} invalid={madeByConsent.getHasError()}
                    onChange={(checked) => binding.setValue(section.madeByConsent, checked)} />
                <FFieldCheckbox id={incidentToArrest.id} label={incidentToArrest.label} checked={incidentToArrest.getValue() as boolean} disabled={!incidentToArrest.getIsEnabled()} invalid={incidentToArrest.getHasError()}
                    onChange={(checked) => binding.setValue(section.incidentToArrest, checked)} />
                <FFieldCheckbox id={inventoryVehicleTowed.id} label={inventoryVehicleTowed.label} checked={inventoryVehicleTowed.getValue() as boolean} disabled={!inventoryVehicleTowed.getIsEnabled()} invalid={inventoryVehicleTowed.getHasError()}
                    onChange={(checked) => binding.setValue(section.inventoryVehicleTowed, checked)} />
                <FFieldCheckbox id={probableCause.id} label={probableCause.label} checked={probableCause.getValue() as boolean} disabled={!probableCause.getIsEnabled()} invalid={probableCause.getHasError()}
                    onChange={(checked) => binding.setValue(section.probableCause, checked)} />
            </div>
            <FFormStackPanel height={22} direction="horizontal">
                <FFieldCheckbox id={basisOther.id} label={basisOther.label} checked={basisOther.getValue() as boolean} disabled={!basisOther.getIsEnabled()} invalid={basisOther.getHasError()}
                    onChange={(checked) => binding.setValue(section.basisOther, checked)} />
                    
                <FFieldControl label={basisOtherSpecify.label} labelFor={basisOtherSpecify.id} borderEdges={["bottom"]}>
                    <FFieldInput
                        id={basisOtherSpecify.id}
                        disabled={!basisOtherSpecify.getIsEnabled() || basisOther.getIsEmpty()}
                        invalid={basisOtherSpecify.getHasError()}
                        value={basisOtherSpecify.getValue()}
                        onChange={(value) => binding.setValue(section.basisOtherSpecify, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            
        </FSection>
    );
};
