import React from "react";
import { ISectionBinding, FCheckboxField, FFormStackPanel, FSection, FTextField } from "@forms/core";

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
                                <FCheckboxField field={ofDriver}
                                    onChange={(checked) => binding.setValue(section.ofDriver, checked)} />
                                <FCheckboxField field={ofPedestrian}
                                    onChange={(checked) => binding.setValue(section.ofPedestrian, checked)} />
                            </div>
                        </FFormStackPanel>
                        <FCheckboxField field={consentSearchRequested}
                            onChange={(checked) => binding.update({ update: (current) => current.setConsentSearchRequested(checked) })} />
                        <FCheckboxField field={consentGiven}
                            onChange={(checked) => binding.update({ update: (current) => current.setConsentGiven(checked) })} />
                        <FCheckboxField field={madeByConsent}
                            onChange={(checked) => binding.setValue(section.madeByConsent, checked)} />
                        <FCheckboxField field={incidentToArrest}
                            onChange={(checked) => binding.setValue(section.incidentToArrest, checked)} />
                    </FFormStackPanel>
                </div>
                <div className="w-100 ps-2">
                    <FFormStackPanel direction="horizontal">
                        <FCheckboxField field={ofVehicle}
                            onChange={(checked) => binding.setValue(section.ofVehicle, checked)} />
                        <FCheckboxField field={ofPassenger}
                            onChange={(checked) => binding.setValue(section.ofPassenger, checked)} />
                    </FFormStackPanel>
                    <FFormStackPanel direction="horizontal">
                        <FCheckboxField field={consentSearchRequestedYes} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentRequested(current.consentSearchRequestedYes) })} />
                        <FCheckboxField field={consentSearchRequestedNo} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentRequested(current.consentSearchRequestedNo) })} />
                    </FFormStackPanel>
                    <FFormStackPanel direction="horizontal">
                        <FCheckboxField field={consentGivenYes} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentGiven(current.consentGivenYes) })} />
                        <FCheckboxField field={consentGivenNo} type="radio"
                            onChange={() => binding.update({ update: (current) => current.selectConsentGiven(current.consentGivenNo) })} />
                    </FFormStackPanel>
                    <FCheckboxField field={inventoryVehicleTowed}
                        onChange={(checked) => binding.setValue(section.inventoryVehicleTowed, checked)} />
                    <FCheckboxField field={probableCause}
                        onChange={(checked) => binding.setValue(section.probableCause, checked)} />
                </div>
            </FFormStackPanel>
            <div className="ps-2">
                <FFormStackPanel direction="horizontal" height={22}>
                    <FCheckboxField field={basisOther}
                        onChange={(checked) => binding.setValue(section.basisOther, checked)} />

                    <div className="ps-2">
                        <FTextField
                            field={basisOtherSpecify}
                            borderEdges={["bottom"]}
                            disabled={basisOther.getIsEmpty()}
                            inputPadding={0}
                            onChange={(value) => binding.setValue(section.basisOtherSpecify, value)}
                        />
                    </div>
                </FFormStackPanel>
            </div>
            
        </FSection>
    );
};
