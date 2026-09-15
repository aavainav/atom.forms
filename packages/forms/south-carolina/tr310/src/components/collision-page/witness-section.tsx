import React, { useCallback } from "react";
import { useService } from "@common/react";
import { FieldDefinition, IOptionValue, ISectionBinding, OptionFieldModel, StringFieldModel, FFieldControl, FFieldSelect, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { WitnessSectionModel } from "../../models/collision-page/witness-section";
import { ITR310Service } from "../../services";
import { TextField } from "../fields";

interface IWitnessSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<WitnessSectionModel>;
}

/** One of the three rows the section prints, gathered so the row can be rendered once rather than three times. */
interface IWitnessRow {
    readonly address: FieldDefinition<StringFieldModel>;
    readonly city: FieldDefinition<StringFieldModel>;
    readonly firstName: FieldDefinition<StringFieldModel>;
    readonly lastName: FieldDefinition<StringFieldModel>;
    readonly middleInitial: FieldDefinition<StringFieldModel>;
    readonly propertyDamageAmount: FieldDefinition<StringFieldModel>;
    readonly propertyDamageDescription: FieldDefinition<StringFieldModel>;
    readonly state: FieldDefinition<OptionFieldModel>;
    readonly telephone: FieldDefinition<StringFieldModel>;
    readonly type: FieldDefinition<StringFieldModel>;
    readonly zipCode: FieldDefinition<StringFieldModel>;
}

/**
 * Defines the witness and property owner section of the TR-310.
 *
 * The form prints a fixed three rows, so they are three numbered groups of fields rather than a collection; the
 * rows are gathered into a shape the row renderer takes so the eleven columns are laid out once.
 */
export const WitnessSection = ({ binding }: IWitnessSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);

    const rows: ReadonlyArray<IWitnessRow> = [
        {
            type: section.oneType, firstName: section.oneFirstName, middleInitial: section.oneMiddleInitial, lastName: section.oneLastName,
            address: section.oneAddress, city: section.oneCity, state: section.oneState, zipCode: section.oneZipCode, telephone: section.oneTelephone,
            propertyDamageAmount: section.onePropertyDamageAmount, propertyDamageDescription: section.onePropertyDamageDescription
        },
        {
            type: section.twoType, firstName: section.twoFirstName, middleInitial: section.twoMiddleInitial, lastName: section.twoLastName,
            address: section.twoAddress, city: section.twoCity, state: section.twoState, zipCode: section.twoZipCode, telephone: section.twoTelephone,
            propertyDamageAmount: section.twoPropertyDamageAmount, propertyDamageDescription: section.twoPropertyDamageDescription
        },
        {
            type: section.threeType, firstName: section.threeFirstName, middleInitial: section.threeMiddleInitial, lastName: section.threeLastName,
            address: section.threeAddress, city: section.threeCity, state: section.threeState, zipCode: section.threeZipCode, telephone: section.threeTelephone,
            propertyDamageAmount: section.threePropertyDamageAmount, propertyDamageDescription: section.threePropertyDamageDescription
        }
    ];

    return (
        <FSection>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">WITNESS (W) or PROPERTY OWNER (P)</span></FLabel>
            {rows.map((row, index) => {
                const state = section.get<OptionFieldModel>(row.state);

                return (
                    <FFormStackPanel key={index} height={44} direction="horizontal">
                        <TextField field={section.get<StringFieldModel>(row.type)} width={40} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.type, value)} />
                        <TextField field={section.get<StringFieldModel>(row.firstName)} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.firstName, value)} />
                        <TextField field={section.get<StringFieldModel>(row.middleInitial)} width={36} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.middleInitial, value)} />
                        <TextField field={section.get<StringFieldModel>(row.lastName)} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.lastName, value)} />
                        <TextField field={section.get<StringFieldModel>(row.address)} width={130} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.address, value)} />
                        <TextField field={section.get<StringFieldModel>(row.city)} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.city, value)} />
                        <FFieldControl width={60} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
                            <FFieldSelect
                                id={state.id}
                                disabled={!state.getIsEnabled()}
                                format="valueOnly"
                                invalid={state.getHasError()}
                                options={loadStateOptions}
                                searchable
                                value={state.getValue()}
                                onChange={(value) => binding.setValue(row.state, value as IOptionValue)}
                            />
                        </FFieldControl>
                        <TextField field={section.get<StringFieldModel>(row.zipCode)} width={70} maxlength={10} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.zipCode, value)} />
                        <TextField field={section.get<StringFieldModel>(row.telephone)} width={100} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.telephone, value)} />
                        <TextField field={section.get<StringFieldModel>(row.propertyDamageAmount)} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(row.propertyDamageAmount, value)} />
                        <TextField field={section.get<StringFieldModel>(row.propertyDamageDescription)} width={130} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(row.propertyDamageDescription, value)} />
                    </FFormStackPanel>
                );
            })}
        </FSection>
    );
};
