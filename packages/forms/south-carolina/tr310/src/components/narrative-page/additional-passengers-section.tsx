import React from "react";
import { ISectionCollectionBinding, FLabel, FSection } from "@forms/core";

import { AdditionalPassengersSectionModel } from "../../models/narrative-page/additional-passengers-section";
import { PassengerRows } from "../passenger-rows";

interface IAdditionalPassengersSectionProps {
    /** Binds the four additional passenger rows to the form controller, supplying each row's current values and applying changes back to the form. */
    readonly binding: ISectionCollectionBinding<AdditionalPassengersSectionModel>;
}

/** Defines the additional passengers section of the narrative page, which takes the same columns as the person page's own passenger rows. */
export const AdditionalPassengersSection = ({ binding }: IAdditionalPassengersSectionProps): React.JSX.Element => {
    const rows = binding.get().getSections<AdditionalPassengersSectionModel>().map((_, index) => binding.getSection(index));

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">ADDITIONAL PASSENGERS</span></FLabel>
            <PassengerRows rows={rows} />
        </FSection>
    );
};
