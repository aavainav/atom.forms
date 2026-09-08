import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { LicenseSectionModel } from "../../models/complaint-page/license-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox } from "../fields";

interface ILicenseSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<LicenseSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the driver license section of the Oklahoma City traffic citation form's complaint page. */
export const LicenseSection = ({ binding, valueListController }: ILicenseSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const identifier = section.getIdentifier();
    const licenseClass = section.getLicenseClass();
    const endorsements = section.getEndorsements();
    const state = section.getState();
    const expires = section.getExpires();

    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={identifier} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.identifier, value)} /></div>
                <TextBox field={licenseClass} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.licenseClass, value)} />
                <TextBox field={endorsements} width={140} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.endorsements, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
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
                <TextBox field={expires} type="date" width={170} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.expires, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
