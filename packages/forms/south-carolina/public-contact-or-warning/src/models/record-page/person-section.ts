import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IPersonSection extends ISection {
}

export interface IPersonSectionModel extends IPersonSection {
}

/** Represents the model for the person section (the person contacted) of the public contact/warning record. */
export class PersonSectionModel extends SectionModel implements IPersonSectionModel {
    private formSchema: PublicContactOrWarningFormSchema = this.getSchema<PublicContactOrWarningFormSchema>();

    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personFirstName;
    public readonly middleInitial: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personMiddleInitial;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personLastName;
    public readonly licensedState: FieldDefinition<OptionFieldModel> = this.formSchema.personFields.personLicensedState;
    public readonly driverLicenseNumber: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personDriverLicenseNumber;
    public readonly race: FieldDefinition<OptionFieldModel> = this.formSchema.personFields.personRace;
    public readonly gender: FieldDefinition<OptionFieldModel> = this.formSchema.personFields.personGender;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personDateOfBirth;
    public readonly latitude: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personLatitude;
    public readonly longitude: FieldDefinition<StringFieldModel> = this.formSchema.personFields.personLongitude;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleInitial(): StringFieldModel { return this.get<StringFieldModel>(this.middleInitial); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getLicensedState(): OptionFieldModel { return this.get<OptionFieldModel>(this.licensedState); }
    public getDriverLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.driverLicenseNumber); }
    public getRace(): OptionFieldModel { return this.get<OptionFieldModel>(this.race); }
    public getGender(): OptionFieldModel { return this.get<OptionFieldModel>(this.gender); }
    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getLatitude(): StringFieldModel { return this.get<StringFieldModel>(this.latitude); }
    public getLongitude(): StringFieldModel { return this.get<StringFieldModel>(this.longitude); }
}
