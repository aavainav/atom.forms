import React from "react";
import { ISectionBinding, FLabel, FSection } from "@forms/core";

import { PassengersSectionModel } from "../../models/person-page/passengers-section";
import { PassengerRows, toPassengerRows } from "../passenger-rows";

interface IPassengersSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PassengersSectionModel>;
}

/** Defines the passengers section of the person page; a fifth passenger goes on the narrative page's additional passengers. */
export const PassengersSection = ({ binding }: IPassengersSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">PASSENGERS</span></FLabel>
            <PassengerRows
                rows={toPassengerRows(section)}
                section={section}
               
                onChange={(definition, value) => binding.setValue(definition, value)}
            />
        </FSection>
    );
};
