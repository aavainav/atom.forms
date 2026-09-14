import { 
    ISection,
    BooleanFieldModel,
    FieldDefinition,
    NumberFieldModel, 
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IViolatorSection extends ISection {
}

export interface IViolatorSectionModel extends IViolatorSection {
}

/** Represents the model for the violator section of the s438 form's front page. */
export class ViolatorSectionModel extends SectionModel implements IViolatorSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorLastName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorStreetAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorZipCode;
    public readonly driverLicenseState: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorDriverLicenseState;
    public readonly driverLicenseNumber: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorDriverLicenseNumber;
    public readonly driverLicenseClass: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorDriverLicenseClass;
    public readonly commercialDriverLicenseYes: FieldDefinition<BooleanFieldModel> = this.formSchema.violatorFields.violatorCommercialDriverLicenseYes;
    public readonly commercialDriverLicenseNo: FieldDefinition<BooleanFieldModel> = this.formSchema.violatorFields.violatorCommercialDriverLicenseNo;
    public readonly race: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorRace;
    public readonly sex: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorSex;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorDateOfBirth;
    public readonly height: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorHeight;
    public readonly weight: FieldDefinition<NumberFieldModel> = this.formSchema.violatorFields.violatorWeight;
    public readonly hairColor: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorHairColor;
    public readonly eyeColor: FieldDefinition<StringFieldModel> = this.formSchema.violatorFields.violatorEyeColor;

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