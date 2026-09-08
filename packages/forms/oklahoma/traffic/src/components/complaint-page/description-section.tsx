import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { DescriptionSectionModel } from "../../models/complaint-page/description-section";
import { IOKTrafficService } from "../../services";
import { OKTrafficValueListId } from "../../value-lists";
import { NumberBox, SelectBox, TextBox } from "../fields";

interface IDescriptionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DescriptionSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the defendant's physical description on the Oklahoma City traffic citation form's complaint page. */
export const DescriptionSection = ({ binding, valueListController }: IDescriptionSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const dateOfBirth = section.getDateOfBirth();
    const race = section.getRace();
    const ethnicity = section.getEthnicity();
    const sex = section.getSex();
    const height = section.getHeight();
    const weight = section.getWeight();

    const loadSexOptions = useCallback(() => okTrafficService.getSexOptions(), [okTrafficService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <TextBox field={dateOfBirth} type="date" width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.dateOfBirth, value)} />
                <TextBox field={race} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.race, value)} />
                <TextBox field={ethnicity} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.ethnicity, value)} />
                <SelectBox
                    cacheKey={OKTrafficValueListId.sex}
                    controller={valueListController}
                    field={sex}
                    load={loadSexOptions}
                    format="valueOnly"
                    width={100}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.sex, value)}
                />
                <TextBox field={height} width={100} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.height, value)} />
                <NumberBox field={weight} width={110} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.weight, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
