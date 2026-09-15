import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { RegisteredOwnerSectionModel } from "../../models/detail-page/registered-owner-section";
import { IOKParkingService } from "../../services";

interface IRegisteredOwnerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RegisteredOwnerSectionModel>;
}

/** Defines the registered owner section of the Oklahoma City parking violation form's detail page. */
export const RegisteredOwnerSection = ({ binding }: IRegisteredOwnerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okParkingService = useService<IOKParkingService>(IOKParkingService);

    const firstName = section.getFirstName();
    const middleName = section.getMiddleName();
    const lastName = section.getLastName();
    const suffix = section.getSuffix();
    const address = section.getAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();

    const loadStateOptions = useCallback(() => okParkingService.getStateOptions(), [okParkingService]);

    return (
        <FSection>
            <div className="fw-bold mt-3">REGISTERED OWNER</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={firstName.label} labelFor={firstName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={firstName.id}
                            disabled={!firstName.getIsEnabled()}
                            invalid={firstName.getHasError()}
                            value={firstName.getValue()}
                            onChange={(value) => binding.setValue(section.firstName, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={middleName.label} labelFor={middleName.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={middleName.id}
                            disabled={!middleName.getIsEnabled()}
                            invalid={middleName.getHasError()}
                            value={middleName.getValue()}
                            onChange={(value) => binding.setValue(section.middleName, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={lastName.label} labelFor={lastName.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={lastName.id}
                            disabled={!lastName.getIsEnabled()}
                            invalid={lastName.getHasError()}
                            value={lastName.getValue()}
                            onChange={(value) => binding.setValue(section.lastName, value)}
                        />
                    </FFieldControl>
                </div>
                <FFieldControl width={110} label={suffix.label} labelFor={suffix.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={suffix.id}
                        disabled={!suffix.getIsEnabled()}
                        invalid={suffix.getHasError()}
                        value={suffix.getValue()}
                        onChange={(value) => binding.setValue(section.suffix, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={address.label} labelFor={address.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={address.id}
                            disabled={!address.getIsEnabled()}
                            invalid={address.getHasError()}
                            value={address.getValue()}
                            onChange={(value) => binding.setValue(section.address, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={city.label} labelFor={city.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={city.id}
                            disabled={!city.getIsEnabled()}
                            invalid={city.getHasError()}
                            value={city.getValue()}
                            onChange={(value) => binding.setValue(section.city, value)}
                        />
                    </FFieldControl>
                </div>
                <FFieldControl width={110} label={state.label} labelFor={state.id} borderEdges={["left", "top"]}>
                    <FFieldSelect
                        id={state.id}
                        disabled={!state.getIsEnabled()}
                        format="valueOnly"
                        invalid={state.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={state.getValue()}
                        onChange={(value) => binding.setValue(section.state, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl width={140} label={zipCode.label} labelFor={zipCode.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={zipCode.id}
                        disabled={!zipCode.getIsEnabled()}
                        invalid={zipCode.getHasError()}
                        value={zipCode.getValue()}
                        onChange={(value) => binding.setValue(section.zipCode, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
