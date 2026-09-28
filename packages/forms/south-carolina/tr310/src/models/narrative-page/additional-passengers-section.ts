import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IAdditionalPassengersSection extends ISection {
}

export interface IAdditionalPassengersSectionModel extends IAdditionalPassengersSection {
}

/** Represents the model for one additional passenger row. The narrative page carries a fixed four of these, taking the same columns as the person page's own passenger rows, for passengers past the first four. */
export class AdditionalPassengersSectionModel extends SectionModel implements IAdditionalPassengersSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(AdditionalPassengersSectionModel);

    public readonly personNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.personNumber;
    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.unitNumber;
    public readonly nameAndAddress: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.nameAndAddress;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.dateOfBirth;
    public readonly injuryStatus: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.injuryStatus;
    public readonly sex: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.sex;
    public readonly race: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.race;
    public readonly seatingLocation: FieldDefinition<StringFieldModel> = this.schema.additionalPassengersFields.seatingLocation;
    public readonly ejection: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.ejection;
    public readonly medicalFacilityTransport: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.medicalFacilityTransport;
    public readonly airBagDeployment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.airBagDeployment;
    public readonly safetyEquipment: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.safetyEquipment;
    public readonly restraintDevice: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.restraintDevice;
    public readonly headInjury: FieldDefinition<OptionFieldModel> = this.schema.additionalPassengersFields.headInjury;

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
