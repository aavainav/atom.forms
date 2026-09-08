import React, { useCallback } from "react";
import { useService } from "@common/react";
import { FieldDefinition, ISectionBinding, IValueListController, OptionFieldModel, FBorder, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { DamageSectionModel } from "../../models/unit-page/damage-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodeBox, CodeLegend, useOptions } from "../fields";

interface IDamageSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DamageSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/**
 * Defines the location of damaged areas section of the TR-310 unit page.
 *
 * The initial point of contact and all twelve other areas draw on the same list, whose codes 01 through 12 are the
 * clock positions on the vehicle diagram the paper form prints beside these boxes.
 */
export const DamageSection = ({ binding, valueListController }: IDamageSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const load = useCallback(() => tr310Service.getDamageAreaOptions(), [tr310Service]);
    const options = useOptions(valueListController, TR310ValueListId.damageArea, load);

    const areas: ReadonlyArray<FieldDefinition<OptionFieldModel>> = [
        section.areaOne, section.areaTwo, section.areaThree, section.areaFour,
        section.areaFive, section.areaSix, section.areaSeven, section.areaEight,
        section.areaNine, section.areaTen, section.areaEleven, section.areaTwelve
    ];

    return (
        <FSection>
            <FBorder borderEdges={["top", "left", "right"]}>
                <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">LOCATION OF DAMAGED AREAS</span></FLabel>
                <FFormStackPanel direction="horizontal">
                    <CodeBox
                        cacheKey={TR310ValueListId.damageArea}
                        controller={valueListController}
                        field={section.getInitialPointOfContact()}
                        label={section.getInitialPointOfContact().label}
                        load={load}
                        width={180}
                        borderEdges={["top", "right"]}
                        onChange={(value) => binding.setValue(section.initialPointOfContact, value)}
                    />
                    <CodeLegend options={options} columns={3} />
                </FFormStackPanel>
                <FLabel fontSize="6" textAlignment="center">All Other Areas of Damage</FLabel>
                <FFormStackPanel height={44} direction="horizontal">
                    {areas.map((definition, index) => (
                        <CodeBox
                            key={index}
                            cacheKey={TR310ValueListId.damageArea}
                            controller={valueListController}
                            field={section.get<OptionFieldModel>(definition)}
                            label={String(index + 1)}
                            load={load}
                            width={60}
                            borderEdges={["top", "left"]}
                            onChange={(value) => binding.setValue(definition, value)}
                        />
                    ))}
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
};
