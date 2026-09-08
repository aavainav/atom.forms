import React, { useCallback } from "react";
import { useService } from "@common/react";
import { FieldDefinition, FieldModel, IOptionValue, IValueListController, OptionFieldModel, SectionModel, StringFieldModel, TValueType, FFormStackPanel } from "@forms/core";

import { ITR310Service } from "../services";
import { TR310ValueListId } from "../value-lists";
import { CodeBox, TextField } from "./fields";

/**
 * The fourteen columns one passenger row carries.
 *
 * The person page and the narrative page print the same row under different names - passengers and additional
 * passengers - and their section models expose the same accessors, so a row is described here once and both
 * sections hand their own field definitions to the same renderer.
 */
export interface IPassengerRow {
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

interface IPassengerRowsProps {
    /** The rows to render, in the order the form prints them. */
    readonly rows: ReadonlyArray<IPassengerRow>;
    /** The section holding the rows, which the current field values are read from. */
    readonly section: SectionModel;
    /** Caches the value lists backing the rows' coded columns, so they are only loaded once per form. */
    readonly valueListController: IValueListController;

    onChange: (definition: FieldDefinition<FieldModel<TValueType>>, value: TValueType) => void;
}

/** Renders a block of passenger rows, one line per passenger, as the form prints them. */
export const PassengerRows = ({ rows, section, valueListController, onChange }: IPassengerRowsProps): React.JSX.Element => {
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadAirBagOptions = useCallback(() => tr310Service.getAirBagDeploymentOptions(), [tr310Service]);
    const loadEjectionOptions = useCallback(() => tr310Service.getEjectionOptions(), [tr310Service]);
    const loadGenderOptions = useCallback(() => tr310Service.getGenderOptions(), [tr310Service]);
    const loadHeadInjuryOptions = useCallback(() => tr310Service.getHeadInjuryOptions(), [tr310Service]);
    const loadInjuryOptions = useCallback(() => tr310Service.getInjuryStatusOptions(), [tr310Service]);
    const loadRestraintOptions = useCallback(() => tr310Service.getRestraintDeviceOptions(), [tr310Service]);
    const loadSafetyEquipmentOptions = useCallback(() => tr310Service.getSafetyEquipmentUseOptions(), [tr310Service]);
    const loadTransportOptions = useCallback(() => tr310Service.getMedicalFacilityTransportOptions(), [tr310Service]);

    const coded = (definition: FieldDefinition<OptionFieldModel>, cacheKey: string, load: () => Promise<Array<IOptionValue>>): React.JSX.Element => (
        <CodeBox
            cacheKey={cacheKey}
            controller={valueListController}
            field={section.get<OptionFieldModel>(definition)}
            label={section.get<OptionFieldModel>(definition).label}
            load={load}
            borderEdges={["top", "left"]}
            onChange={(value) => onChange(definition, value)}
        />
    );

    return (
        <>
            {rows.map((row, index) => (
                <FFormStackPanel key={index} height={44} direction="horizontal">
                    <TextField field={section.get<StringFieldModel>(row.personNumber)} width={70} borderEdges={["top", "left"]} onChange={(value) => onChange(row.personNumber, value)} />
                    <TextField field={section.get<StringFieldModel>(row.unitNumber)} width={60} borderEdges={["top", "left"]} onChange={(value) => onChange(row.unitNumber, value)} />
                    <TextField field={section.get<StringFieldModel>(row.nameAndAddress)} width={260} borderEdges={["top", "left"]} onChange={(value) => onChange(row.nameAndAddress, value)} />
                    <TextField field={section.get<StringFieldModel>(row.dateOfBirth)} width={90} borderEdges={["top", "left"]} onChange={(value) => onChange(row.dateOfBirth, value)} />
                    {coded(row.injuryStatus, TR310ValueListId.injuryStatus, loadInjuryOptions)}
                    {coded(row.sex, TR310ValueListId.gender, loadGenderOptions)}
                    <TextField field={section.get<StringFieldModel>(row.race)} width={54} borderEdges={["top", "left"]} onChange={(value) => onChange(row.race, value)} />
                    <TextField field={section.get<StringFieldModel>(row.seatingLocation)} width={54} borderEdges={["top", "left"]} onChange={(value) => onChange(row.seatingLocation, value)} />
                    {coded(row.ejection, TR310ValueListId.ejection, loadEjectionOptions)}
                    {coded(row.medicalFacilityTransport, TR310ValueListId.medicalFacilityTransport, loadTransportOptions)}
                    {coded(row.airBagDeployment, TR310ValueListId.airBagDeployment, loadAirBagOptions)}
                    {coded(row.safetyEquipment, TR310ValueListId.safetyEquipmentUse, loadSafetyEquipmentOptions)}
                    {coded(row.restraintDevice, TR310ValueListId.restraintDevice, loadRestraintOptions)}
                    {coded(row.headInjury, TR310ValueListId.yesNo, loadHeadInjuryOptions)}
                </FFormStackPanel>
            ))}
        </>
    );
};

/** Builds the four rows a passengers section carries from the accessors both such sections expose. */
export function toPassengerRows(section: {
    readonly oneAirBagDeployment: FieldDefinition<OptionFieldModel>; readonly oneDateOfBirth: FieldDefinition<StringFieldModel>;
    readonly oneEjection: FieldDefinition<OptionFieldModel>; readonly oneHeadInjury: FieldDefinition<OptionFieldModel>;
    readonly oneInjuryStatus: FieldDefinition<OptionFieldModel>; readonly oneMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
    readonly oneNameAndAddress: FieldDefinition<StringFieldModel>; readonly onePersonNumber: FieldDefinition<StringFieldModel>;
    readonly oneRace: FieldDefinition<StringFieldModel>; readonly oneRestraintDevice: FieldDefinition<OptionFieldModel>;
    readonly oneSafetyEquipment: FieldDefinition<OptionFieldModel>; readonly oneSeatingLocation: FieldDefinition<StringFieldModel>;
    readonly oneSex: FieldDefinition<OptionFieldModel>; readonly oneUnitNumber: FieldDefinition<StringFieldModel>;

    readonly twoAirBagDeployment: FieldDefinition<OptionFieldModel>; readonly twoDateOfBirth: FieldDefinition<StringFieldModel>;
    readonly twoEjection: FieldDefinition<OptionFieldModel>; readonly twoHeadInjury: FieldDefinition<OptionFieldModel>;
    readonly twoInjuryStatus: FieldDefinition<OptionFieldModel>; readonly twoMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
    readonly twoNameAndAddress: FieldDefinition<StringFieldModel>; readonly twoPersonNumber: FieldDefinition<StringFieldModel>;
    readonly twoRace: FieldDefinition<StringFieldModel>; readonly twoRestraintDevice: FieldDefinition<OptionFieldModel>;
    readonly twoSafetyEquipment: FieldDefinition<OptionFieldModel>; readonly twoSeatingLocation: FieldDefinition<StringFieldModel>;
    readonly twoSex: FieldDefinition<OptionFieldModel>; readonly twoUnitNumber: FieldDefinition<StringFieldModel>;

    readonly threeAirBagDeployment: FieldDefinition<OptionFieldModel>; readonly threeDateOfBirth: FieldDefinition<StringFieldModel>;
    readonly threeEjection: FieldDefinition<OptionFieldModel>; readonly threeHeadInjury: FieldDefinition<OptionFieldModel>;
    readonly threeInjuryStatus: FieldDefinition<OptionFieldModel>; readonly threeMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
    readonly threeNameAndAddress: FieldDefinition<StringFieldModel>; readonly threePersonNumber: FieldDefinition<StringFieldModel>;
    readonly threeRace: FieldDefinition<StringFieldModel>; readonly threeRestraintDevice: FieldDefinition<OptionFieldModel>;
    readonly threeSafetyEquipment: FieldDefinition<OptionFieldModel>; readonly threeSeatingLocation: FieldDefinition<StringFieldModel>;
    readonly threeSex: FieldDefinition<OptionFieldModel>; readonly threeUnitNumber: FieldDefinition<StringFieldModel>;

    readonly fourAirBagDeployment: FieldDefinition<OptionFieldModel>; readonly fourDateOfBirth: FieldDefinition<StringFieldModel>;
    readonly fourEjection: FieldDefinition<OptionFieldModel>; readonly fourHeadInjury: FieldDefinition<OptionFieldModel>;
    readonly fourInjuryStatus: FieldDefinition<OptionFieldModel>; readonly fourMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
    readonly fourNameAndAddress: FieldDefinition<StringFieldModel>; readonly fourPersonNumber: FieldDefinition<StringFieldModel>;
    readonly fourRace: FieldDefinition<StringFieldModel>; readonly fourRestraintDevice: FieldDefinition<OptionFieldModel>;
    readonly fourSafetyEquipment: FieldDefinition<OptionFieldModel>; readonly fourSeatingLocation: FieldDefinition<StringFieldModel>;
    readonly fourSex: FieldDefinition<OptionFieldModel>; readonly fourUnitNumber: FieldDefinition<StringFieldModel>;
}): ReadonlyArray<IPassengerRow> {
    return [
        {
            airBagDeployment: section.oneAirBagDeployment, dateOfBirth: section.oneDateOfBirth, ejection: section.oneEjection,
            headInjury: section.oneHeadInjury, injuryStatus: section.oneInjuryStatus, medicalFacilityTransport: section.oneMedicalFacilityTransport,
            nameAndAddress: section.oneNameAndAddress, personNumber: section.onePersonNumber, race: section.oneRace,
            restraintDevice: section.oneRestraintDevice, safetyEquipment: section.oneSafetyEquipment,
            seatingLocation: section.oneSeatingLocation, sex: section.oneSex, unitNumber: section.oneUnitNumber
        },
        {
            airBagDeployment: section.twoAirBagDeployment, dateOfBirth: section.twoDateOfBirth, ejection: section.twoEjection,
            headInjury: section.twoHeadInjury, injuryStatus: section.twoInjuryStatus, medicalFacilityTransport: section.twoMedicalFacilityTransport,
            nameAndAddress: section.twoNameAndAddress, personNumber: section.twoPersonNumber, race: section.twoRace,
            restraintDevice: section.twoRestraintDevice, safetyEquipment: section.twoSafetyEquipment,
            seatingLocation: section.twoSeatingLocation, sex: section.twoSex, unitNumber: section.twoUnitNumber
        },
        {
            airBagDeployment: section.threeAirBagDeployment, dateOfBirth: section.threeDateOfBirth, ejection: section.threeEjection,
            headInjury: section.threeHeadInjury, injuryStatus: section.threeInjuryStatus, medicalFacilityTransport: section.threeMedicalFacilityTransport,
            nameAndAddress: section.threeNameAndAddress, personNumber: section.threePersonNumber, race: section.threeRace,
            restraintDevice: section.threeRestraintDevice, safetyEquipment: section.threeSafetyEquipment,
            seatingLocation: section.threeSeatingLocation, sex: section.threeSex, unitNumber: section.threeUnitNumber
        },
        {
            airBagDeployment: section.fourAirBagDeployment, dateOfBirth: section.fourDateOfBirth, ejection: section.fourEjection,
            headInjury: section.fourHeadInjury, injuryStatus: section.fourInjuryStatus, medicalFacilityTransport: section.fourMedicalFacilityTransport,
            nameAndAddress: section.fourNameAndAddress, personNumber: section.fourPersonNumber, race: section.fourRace,
            restraintDevice: section.fourRestraintDevice, safetyEquipment: section.fourSafetyEquipment,
            seatingLocation: section.fourSeatingLocation, sex: section.fourSex, unitNumber: section.fourUnitNumber
        }
    ];
}
