import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionCollectionBinding, OptionFieldModel, StringFieldModel, FFieldControl, FFieldSelect, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { WitnessSectionModel } from "../../models/collision-page/witness-section";
import { ITR310Service } from "../../services";
import { TextField } from "../fields";

interface IWitnessSectionProps {
    /** Binds the three witness rows to the form controller, supplying each row's current values and applying changes back to the form. */
    readonly binding: ISectionCollectionBinding<WitnessSectionModel>;
}

/** The witness and property owner section of the TR-310: a fixed three rows, each its own section instance in a collection. */
export const WitnessSection = ({ binding }: IWitnessSectionProps): React.JSX.Element => {
    const tr310Service = useService<ITR310Service>(ITR310Service);
    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);

    const rows = binding.get().getSections<WitnessSectionModel>().map((_, index) => binding.getSection(index));

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">WITNESS (W) or PROPERTY OWNER (P)</span></FLabel>
            {rows.map((row, index) => {
                const section = row.get();
                const state = section.get<OptionFieldModel>(section.state);

                return (
                    <FFormStackPanel key={index} height={44} direction="horizontal">
                        <TextField field={section.get<StringFieldModel>(section.type)} width={40} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.type, value)} />
                        <TextField field={section.get<StringFieldModel>(section.firstName)} width={100} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.firstName, value)} />
                        <TextField field={section.get<StringFieldModel>(section.middleInitial)} width={36} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.middleInitial, value)} />
                        <TextField field={section.get<StringFieldModel>(section.lastName)} width={100} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.lastName, value)} />
                        <TextField field={section.get<StringFieldModel>(section.address)} width={130} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.address, value)} />
                        <TextField field={section.get<StringFieldModel>(section.city)} width={100} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.city, value)} />
                        <FFieldControl width={60} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
                            <FFieldSelect
                                id={state.id}
                                disabled={!state.getIsEnabled()}
                                format="valueOnly"
                                invalid={state.getHasError()}
                                options={loadStateOptions}
                                searchable
                                value={state.getValue()}
                                onChange={(value) => row.setValue(section.state, value as IOptionValue)}
                            />
                        </FFieldControl>
                        <TextField field={section.get<StringFieldModel>(section.zipCode)} width={70} maxlength={10} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.zipCode, value)} />
                        <TextField field={section.get<StringFieldModel>(section.telephone)} width={100} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.telephone, value)} />
                        <TextField field={section.get<StringFieldModel>(section.propertyDamageAmount)} width={90} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.propertyDamageAmount, value)} />
                        <TextField field={section.get<StringFieldModel>(section.propertyDamageDescription)} width={130} borderEdges={["top", "left", "right"]} onChange={(value) => row.setValue(section.propertyDamageDescription, value)} />
                    </FFormStackPanel>
                );
            })}
        </FSection>
    );
};
