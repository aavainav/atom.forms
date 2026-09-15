import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { RegisteredOwnerSectionModel } from "../../models/supplement-page/registered-owner-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox, YesNoBox } from "../fields";

interface IRegisteredOwnerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RegisteredOwnerSectionModel>;
}

/** Defines the registered owner section of the Oklahoma City traffic citation form's supplement page. */
export const RegisteredOwnerSection = ({ binding }: IRegisteredOwnerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const sameAsSuspect = section.getSameAsSuspect();
    const ownerName = section.getOwnerName();
    const address = section.getAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();

    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);
    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    return (
        <FSection>
            <div className="fw-bold mt-3">Registered Owner</div>
            <FFormStackPanel direction="horizontal">
                <YesNoBox field={sameAsSuspect} load={loadYesNoOptions} width={190} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.sameAsSuspect, value)} />
                <div className="w-100"><TextBox field={ownerName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.ownerName, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={address} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.address, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={city} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} /></div>
                <SelectBox
                    field={state}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={110}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.state, value)}
                />
                <TextBox field={zipCode} width={140} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
