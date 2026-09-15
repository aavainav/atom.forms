import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { LocationSectionModel } from "../../models/citation-page/location-section";
import { IGAUTCService } from "../../services";
import { SelectBox, TextBox } from "../fields";

interface ILocationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<LocationSectionModel>;
}

/** Defines Section III (Location) of the Georgia uniform traffic citation. */
export const LocationSection = ({ binding }: ILocationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const gaUtcService = useService<IGAUTCService>(IGAUTCService);

    const city = section.getCity();
    const county = section.getCounty();
    const street = section.getStreet();

    const loadCountyOptions = useCallback(() => gaUtcService.getCountyOptions(), [gaUtcService]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">SECTION III - LOCATION</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={city} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.city, value)} /></div>
                <SelectBox
                    field={county}
                    load={loadCountyOptions}
                    width={200}
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.county, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={street} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.street, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
