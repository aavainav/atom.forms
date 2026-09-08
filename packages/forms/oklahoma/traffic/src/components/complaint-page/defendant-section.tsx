import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { DefendantSectionModel } from "../../models/complaint-page/defendant-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox } from "../fields";

interface IDefendantSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DefendantSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the defendant section of the Oklahoma City traffic citation form's complaint page. */
export const DefendantSection = ({ binding, valueListController }: IDefendantSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const lastName = section.getLastName();
    const firstName = section.getFirstName();
    const middleName = section.getMiddleName();
    const address = section.getAddress();
    const city = section.getCity();
    const state = section.getState();
    const zipCode = section.getZipCode();

    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={lastName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.lastName, value)} /></div>
                <div className="w-100"><TextBox field={firstName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.firstName, value)} /></div>
                <div className="w-100"><TextBox field={middleName} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.middleName, value)} /></div>
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
        </FSection>
    );
}
