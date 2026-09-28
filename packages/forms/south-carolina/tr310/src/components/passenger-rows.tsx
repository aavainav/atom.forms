import React, { useCallback } from "react";
import { useService } from "@common/react";
import { FieldDefinition, ISectionBinding, IOptionValue, OptionFieldModel, SectionModel, StringFieldModel, FFormStackPanel } from "@forms/core";

import { ITR310Service } from "../services";
import { CodeBox, TextField } from "./fields";

/** The fourteen columns one passenger row carries. The person and narrative pages print the same row under different section models but matching field names, so both hand this one renderer a binding per row. */
export interface IPassengerRowFields {
    readonly airBagDeployment: FieldDefinition<OptionFieldModel>;
    readonly dateOfBirth: FieldDefinition<StringFieldModel>;
    readonly ejection: FieldDefinition<OptionFieldModel>;
    readonly headInjury: FieldDefinition<OptionFieldModel>;
    readonly injuryStatus: FieldDefinition<OptionFieldModel>;
    readonly medicalFacilityTransport: FieldDefinition<OptionFieldModel>;
    readonly nameAndAddress: FieldDefinition<StringFieldModel>;
    readonly personNumber: FieldDefinition<StringFieldModel>;
    readonly race: FieldDefinition<StringFieldModel>;
    readonly restraintDevice: FieldDefinition<OptionFieldModel>;
    readonly safetyEquipment: FieldDefinition<OptionFieldModel>;
    readonly seatingLocation: FieldDefinition<StringFieldModel>;
    readonly sex: FieldDefinition<OptionFieldModel>;
    readonly unitNumber: FieldDefinition<StringFieldModel>;
}

interface IPassengerRowsProps<TSection extends SectionModel & IPassengerRowFields> {
    /** One binding per row, in the order the form prints them. */
    readonly rows: ReadonlyArray<ISectionBinding<TSection>>;
}

/** Renders a block of passenger rows, one line per passenger, as the form prints them -- each row bound to its own section instance. */
export function PassengerRows<TSection extends SectionModel & IPassengerRowFields>({ rows }: IPassengerRowsProps<TSection>): React.JSX.Element {
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadAirBagOptions = useCallback(() => tr310Service.getAirBagDeploymentOptions(), [tr310Service]);
    const loadEjectionOptions = useCallback(() => tr310Service.getEjectionOptions(), [tr310Service]);
    const loadGenderOptions = useCallback(() => tr310Service.getGenderOptions(), [tr310Service]);
    const loadHeadInjuryOptions = useCallback(() => tr310Service.getHeadInjuryOptions(), [tr310Service]);
    const loadInjuryOptions = useCallback(() => tr310Service.getInjuryStatusOptions(), [tr310Service]);
    const loadRestraintOptions = useCallback(() => tr310Service.getRestraintDeviceOptions(), [tr310Service]);
    const loadSafetyEquipmentOptions = useCallback(() => tr310Service.getSafetyEquipmentUseOptions(), [tr310Service]);
    const loadTransportOptions = useCallback(() => tr310Service.getMedicalFacilityTransportOptions(), [tr310Service]);

    return (
        <>
            {rows.map((row, index) => {
                const section = row.get();

                const coded = (definition: FieldDefinition<OptionFieldModel>, load: () => Promise<Array<IOptionValue>>): React.JSX.Element => (
                    <CodeBox
                        field={section.get<OptionFieldModel>(definition)}
                        label={section.get<OptionFieldModel>(definition).label}
                        load={load}
                        borderEdges={["top", "left"]}
                        onChange={(value) => row.setValue(definition, value)}
                    />
                );

                return (
                    <FFormStackPanel key={index} height={44} direction="horizontal">
                        <TextField field={section.get<StringFieldModel>(section.personNumber)} width={70} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.personNumber, value)} />
                        <TextField field={section.get<StringFieldModel>(section.unitNumber)} width={60} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.unitNumber, value)} />
                        <TextField field={section.get<StringFieldModel>(section.nameAndAddress)} width={260} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.nameAndAddress, value)} />
                        <TextField field={section.get<StringFieldModel>(section.dateOfBirth)} width={90} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.dateOfBirth, value)} />
                        {coded(section.injuryStatus, loadInjuryOptions)}
                        {coded(section.sex, loadGenderOptions)}
                        <TextField field={section.get<StringFieldModel>(section.race)} width={54} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.race, value)} />
                        <TextField field={section.get<StringFieldModel>(section.seatingLocation)} width={54} borderEdges={["top", "left"]} onChange={(value) => row.setValue(section.seatingLocation, value)} />
                        {coded(section.ejection, loadEjectionOptions)}
                        {coded(section.medicalFacilityTransport, loadTransportOptions)}
                        {coded(section.airBagDeployment, loadAirBagOptions)}
                        {coded(section.safetyEquipment, loadSafetyEquipmentOptions)}
                        {coded(section.restraintDevice, loadRestraintOptions)}
                        {coded(section.headInjury, loadHeadInjuryOptions)}
                    </FFormStackPanel>
                );
            })}
        </>
    );
}
