import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialViolatorSection extends ISection {
}

export interface ITrialViolatorSectionModel extends ITrialViolatorSection {
}

/** Represents the model for the violator section of the s438 form's trial page. */
export class TrialViolatorSectionModel extends SectionModel implements ITrialViolatorSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialViolatorSectionModel);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorLastName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorStreetAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorZipCode;
    public readonly driverLicenseState: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorDriverLicenseState;
    public readonly driverLicenseNumber: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorDriverLicenseNumber;
    public readonly driverLicenseClass: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorDriverLicenseClass;
    public readonly commercialDriverLicenseYes: FieldDefinition<BooleanFieldModel> = this.schema.trialViolatorFields.trialViolatorCommercialDriverLicenseYes;
    public readonly commercialDriverLicenseNo: FieldDefinition<BooleanFieldModel> = this.schema.trialViolatorFields.trialViolatorCommercialDriverLicenseNo;
    public readonly race: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorRace;
    public readonly sex: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorSex;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorDateOfBirth;
    public readonly height: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorHeight;
    public readonly weight: FieldDefinition<NumberFieldModel> = this.schema.trialViolatorFields.trialViolatorWeight;
    public readonly hairColor: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorHairColor;
    public readonly eyeColor: FieldDefinition<StringFieldModel> = this.schema.trialViolatorFields.trialViolatorEyeColor;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
    public getDriverLicenseState(): StringFieldModel { return this.get<StringFieldModel>(this.driverLicenseState); }
    public getDriverLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.driverLicenseNumber); }
    public getDriverLicenseClass(): StringFieldModel { return this.get<StringFieldModel>(this.driverLicenseClass); }
    public getCommercialDriverLicenseYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.commercialDriverLicenseYes); }
    public getCommercialDriverLicenseNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.commercialDriverLicenseNo); }
    public getRace(): StringFieldModel { return this.get<StringFieldModel>(this.race); }
    public getSex(): StringFieldModel { return this.get<StringFieldModel>(this.sex); }
    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getHeight(): StringFieldModel { return this.get<StringFieldModel>(this.height); }
    public getWeight(): NumberFieldModel { return this.get<NumberFieldModel>(this.weight); }
    public getHairColor(): StringFieldModel { return this.get<StringFieldModel>(this.hairColor); }
    public getEyeColor(): StringFieldModel { return this.get<StringFieldModel>(this.eyeColor); }
}
