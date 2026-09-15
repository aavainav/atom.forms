import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, FBorder, FFieldCheckbox, FFieldControl, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { CollisionSectionModel } from "../../models/collision-page/collision-section";
import { ITR310Service } from "../../services";
import { CodeBox, TextField } from "../fields";

interface ICollisionSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CollisionSectionModel>;
}

/** Defines the collision section of the TR-310 - when and where the collision happened, and the three questions asked about it. */
export const CollisionSection = ({ binding }: ICollisionSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const county = section.getCounty();
    const picturesTaken = section.getPicturesTaken();

    const loadCountyOptions = useCallback(() => tr310Service.getCountyOptions(), [tr310Service]);
    const loadYesNoUnknownOptions = useCallback(() => tr310Service.getYesNoUnknownOptions(), [tr310Service]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getDate()} width={120} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.date, value)} />
                <TextField field={section.getTime()} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.time, value)} />
                <FFieldControl width={180} label={county.label} labelFor={county.id} borderEdges={["top", "left"]}>
                    <FFieldSelect
                        id={county.id}
                        disabled={!county.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={county.getHasError()}
                        options={loadCountyOptions}
                        searchable
                        value={county.getValue()}
                        onChange={(value) => binding.setValue(section.county, value as IOptionValue)}
                    />
                </FFieldControl>
                <TextField field={section.getCityOrTown()} width={260} maxlength={25} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.cityOrTown, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <CodeBox
                    field={section.getSecondaryCrash()}
                    label={section.getSecondaryCrash().label}
                    load={loadYesNoUnknownOptions}
                    width={140}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.secondaryCrash, value)}
                />
                <CodeBox
                    field={section.getPrivatePropertyCollision()}
                    label={section.getPrivatePropertyCollision().label}
                    load={loadYesNoUnknownOptions}
                    width={180}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.privatePropertyCollision, value)}
                />
                <CodeBox
                    field={section.getTotalDamageOverThreshold()}
                    label={section.getTotalDamageOverThreshold().label}
                    load={loadYesNoUnknownOptions}
                    width={240}
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.totalDamageOverThreshold, value)}
                />
                <FBorder height={44} borderEdges={["top", "left", "right"]}>
                    <FFieldCheckbox
                        id={picturesTaken.id}
                        label={picturesTaken.label}
                        checked={picturesTaken.getValue() as boolean}
                        disabled={!picturesTaken.getIsEnabled()}
                        invalid={picturesTaken.getHasError()}
                        onChange={(checked) => binding.setValue(section.picturesTaken, checked)}
                    />
                </FBorder>
            </FFormStackPanel>
        </FSection>
    );
};
