import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { ViolatorSectionModel } from "../../models/citation-page/violator-section";
import { IGAUTCService } from "../../services";
import { GAUTCValueListId } from "../../value-lists";
import { NumberBox, SelectBox, TextBox } from "../fields";

interface IViolatorSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolatorSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines Section I (Violator) of the Georgia uniform traffic citation. */
export const ViolatorSection = ({ binding, valueListController }: IViolatorSectionProps): React.JSX.Element => {
    const section = binding.get();
    const gaUtcService = useService<IGAUTCService>(IGAUTCService);

    const licenseClass = section.getLicenseClass();
    const licenseState = section.getLicenseState();
    const licenseEndorsements = section.getLicenseEndorsements();
    const licenseExpires = section.getLicenseExpires();
    const operatorLicenseNumber = section.getOperatorLicenseNumber();
    const lastName = section.getLastName();
    const suffix = section.getSuffix();
    const firstName = section.getFirstName();
    const middleName = section.getMiddleName();
    const race = section.getRace();
    const sex = section.getSex();
    const address = section.getAddress();
    const apartment = section.getApartment();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();
    const phone = section.getPhone();
    const dateOfBirth = section.getDateOfBirth();
    const hair = section.getHair();
    const height = section.getHeight();
    const weight = section.getWeight();
    const eye = section.getEye();

    const loadSexOptions = useCallback(() => gaUtcService.getSexOptions(), [gaUtcService]);
    const loadStateOptions = useCallback(() => gaUtcService.getStateOptions(), [gaUtcService]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">SECTION I - VIOLATOR</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={licenseClass} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseClass, value)} /></div>
                <SelectBox
                    cacheKey={ValueListId.state}
                    controller={valueListController}
                    field={licenseState}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.licenseState, value)}
                />
                <div className="w-100"><TextBox field={licenseEndorsements} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseEndorsements, value)} /></div>
                <TextBox field={licenseExpires} type="date" width={170} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.licenseExpires, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={operatorLicenseNumber} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.operatorLicenseNumber, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={lastName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.lastName, value)} /></div>
                <TextBox field={suffix} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.suffix, value)} />
                <div className="w-100"><TextBox field={firstName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} /></div>
                <div className="w-100"><TextBox field={middleName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.middleName, value)} /></div>
                <TextBox field={race} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.race, value)} />
                <SelectBox
                    cacheKey={GAUTCValueListId.sex}
                    controller={valueListController}
                    field={sex}
                    load={loadSexOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.sex, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={address} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.address, value)} /></div>
                <TextBox field={apartment} width={130} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.apartment, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={city} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} /></div>
                <SelectBox
                    cacheKey={ValueListId.state}
                    controller={valueListController}
                    field={state}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.state, value)}
                />
                <TextBox field={zipCode} width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
                <div className="w-100"><TextBox field={phone} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.phone, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={dateOfBirth} type="date" width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
                <div className="w-100"><TextBox field={hair} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.hair, value)} /></div>
                <TextBox field={height} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.height, value)} />
                <NumberBox field={weight} label="Weight (lbs.)" width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.weight, value)} />
                <div className="w-100"><TextBox field={eye} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.eye, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
