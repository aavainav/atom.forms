import React from "react";
import { ISectionBinding, IValueListController, FLabel, FSection } from "@forms/core";

import { PassengersSectionModel } from "../../models/person-page/passengers-section";
import { PassengerRows, toPassengerRows } from "../passenger-rows";

interface IPassengersSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PassengersSectionModel>;
    /** Caches the value lists backing this section's coded columns, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the passengers section of the person page; a fifth passenger goes on the narrative page's additional passengers. */
export const PassengersSection = ({ binding, valueListController }: IPassengersSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">PASSENGERS</span></FLabel>
            <PassengerRows
                rows={toPassengerRows(section)}
                section={section}
                valueListController={valueListController}
                onChange={(definition, value) => binding.setValue(definition, value)}
            />
        </FSection>
    );
};
