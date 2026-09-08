import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { WitnessSectionModel } from "../../models/supplement-page/witness-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox } from "../fields";

interface IWitnessSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<WitnessSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the witness/complainant section of the Oklahoma City traffic citation form's supplement page. */
export const WitnessSection = ({ binding, valueListController }: IWitnessSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const type = section.getType();
    const witnessName = section.getWitnessName();
    const address = section.getAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();
    const phone = section.getPhone();
    const socialSecurityNumber = section.getSocialSecurityNumber();
    const email = section.getEmail();

    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);

    return (
        <FSection>
            <div className="fw-bold mt-3">Witness/Complainant Info</div>
            <FFormStackPanel direction="horizontal">
                <TextBox field={type} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.type, value)} />
                <div className="w-100"><TextBox field={witnessName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.witnessName, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={address} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.address, value)} /></div>
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
                <TextBox field={zipCode} width={140} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={phone} width={190} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.phone, value)} />
                <TextBox field={socialSecurityNumber} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.socialSecurityNumber, value)} />
                <div className="w-100"><TextBox field={email} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.email, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
}
