import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { ViolationLocationSectionModel } from "../../models/front-page/violation-location-section";

interface IViolationLocationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationLocationSectionModel>;
}

/** Defines the violation location section for the front page of the S438 citation form. */
export default function ViolationLocationSection({ binding }: IViolationLocationSectionProps): React.JSX.Element {
    const section = binding.get();
    const location = section.getLocation();
    const county = section.getCounty();
    const latitude = section.getLatitude();
    const longitude = section.getLongitude();
    const city = section.getCity();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={location.label} labelFor={location.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={location.id}
                            disabled={!location.getIsEnabled()}
                            invalid={location.getHasError()}
                            value={location.getValue()}
                            onChange={(value) => binding.setValue(section.violationLocation, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={county.label} labelFor={county.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={county.id}
                            disabled={!county.getIsEnabled()}
                            invalid={county.getHasError()}
                            value={county.getValue()}
                            onChange={(value) => binding.setValue(section.violationLocationCounty, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={latitude.label} labelFor={latitude.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={latitude.id}
                            disabled={!latitude.getIsEnabled()}
                            invalid={latitude.getHasError()}
                            value={latitude.getValue()}
                            onChange={(value) => binding.setValue(section.violationLocationLatitude, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={longitude.label} labelFor={longitude.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={longitude.id}
                            disabled={!longitude.getIsEnabled()}
                            invalid={longitude.getHasError()}
                            value={longitude.getValue()}
                            onChange={(value) => binding.setValue(section.violationLocationLongitude, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={city.label} labelFor={city.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={city.id}
                            disabled={!city.getIsEnabled()}
                            invalid={city.getHasError()}
                            value={city.getValue()}
                            onChange={(value) => binding.setValue(section.violationLocationCity, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
