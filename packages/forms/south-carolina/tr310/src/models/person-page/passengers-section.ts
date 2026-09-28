import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPassengersSection extends ISection {
}

export interface IPassengersSectionModel extends IPassengersSection {
}

/** Represents the model for one passenger row. The person page carries a fixed four of these, matching the four rows the paper form prints; a section collection instantiates one independent instance per row. */
export class PassengersSectionModel extends SectionModel implements IPassengersSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(PassengersSectionModel);

    public readonly personNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.personNumber;
    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.schema.passengersFields.unitNumber;
    public readonly nameAndAddress: FieldDefinition<StringFieldModel> = this.schema.passengersFields.nameAndAddress;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.schema.passengersFields.dateOfBirth;
    public readonly injuryStatus: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.injuryStatus;
    public readonly sex: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.sex;
    public readonly race: FieldDefinition<StringFieldModel> = this.schema.passengersFields.race;
    public readonly seatingLocation: FieldDefinition<StringFieldModel> = this.schema.passengersFields.seatingLocation;
    public readonly ejection: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.ejection;
    public readonly medicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.medicalFacilityTransport;
    public readonly airBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.airBagDeployment;
    public readonly safetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.safetyEquipment;
    public readonly restraintDevice: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.restraintDevice;
    public readonly headInjury: FieldDefinition<OptionFieldModel> = this.schema.passengersFields.headInjury;

    public getPersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.personNumber); }
    public getUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.unitNumber); }
    public getNameAndAddress(): StringFieldModel { return this.get<StringFieldModel>(this.nameAndAddress); }
    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getInjuryStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.injuryStatus); }
    public getSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.sex); }
    public getRace(): StringFieldModel { return this.get<StringFieldModel>(this.race); }
    public getSeatingLocation(): StringFieldModel { return this.get<StringFieldModel>(this.seatingLocation); }
    public getEjection(): OptionFieldModel { return this.get<OptionFieldModel>(this.ejection); }
    public getMedicalFacilityTransport(): OptionFieldModel { return this.get<OptionFieldModel>(this.medicalFacilityTransport); }
    public getAirBagDeployment(): OptionFieldModel { return this.get<OptionFieldModel>(this.airBagDeployment); }
    public getSafetyEquipment(): OptionFieldModel { return this.get<OptionFieldModel>(this.safetyEquipment); }
    public getRestraintDevice(): OptionFieldModel { return this.get<OptionFieldModel>(this.restraintDevice); }
    public getHeadInjury(): OptionFieldModel { return this.get<OptionFieldModel>(this.headInjury); }
}
