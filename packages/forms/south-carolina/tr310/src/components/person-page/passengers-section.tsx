import React from "react";
import { ISectionCollectionBinding, FLabel, FSection } from "@forms/core";

import { PassengersSectionModel } from "../../models/person-page/passengers-section";
import { PassengerRows } from "../passenger-rows";

interface IPassengersSectionProps {
    /** Binds the four passenger rows to the form controller, supplying each row's current values and applying changes back to the form. */
    readonly binding: ISectionCollectionBinding<PassengersSectionModel>;
}

/** Defines the passengers section of the person page; a fifth passenger goes on the narrative page's additional passengers. */
export const PassengersSection = ({ binding }: IPassengersSectionProps): React.JSX.Element => {
    const rows = binding.get().getSections<PassengersSectionModel>().map((_, index) => binding.getSection(index));

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">PASSENGERS</span></FLabel>
            <PassengerRows rows={rows} />
        </FSection>
    );
};
