import React from "react";
import { ISectionBinding, FLabel, FSection } from "@forms/core";

import { AdditionalPassengersSectionModel } from "../../models/narrative-page/additional-passengers-section";
import { PassengerRows, toPassengerRows } from "../passenger-rows";

interface IAdditionalPassengersSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<AdditionalPassengersSectionModel>;
}

/** Defines the additional passengers section of the narrative page, which takes the same columns as the person page's own passenger rows. */
export const AdditionalPassengersSection = ({ binding }: IAdditionalPassengersSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">ADDITIONAL PASSENGERS</span></FLabel>
            <PassengerRows
                rows={toPassengerRows(section)}
                section={section}
               
                onChange={(definition, value) => binding.setValue(definition, value)}
            />
        </FSection>
    );
};
