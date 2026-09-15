import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPersonSection extends ISection {
}

export interface IPersonSectionModel extends IPersonSection {
}

/** Represents the model for the person the page records. The form prints one name box; the name is held as three fields so a person dropped onto the page lands in the right part of it. */
export class PersonSectionModel extends SectionModel implements IPersonSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(PersonSectionModel);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.personFields.personFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.personFields.personMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.personFields.personLastName;
    public readonly phoneNumber: FieldDefinition<StringFieldModel> = this.schema.personFields.personPhoneNumber;
    public readonly contributedTo: FieldDefinition<OptionFieldModel> = this.schema.personFields.personContributedTo;
    public readonly dateOfBirth: FieldDefinition<StringFieldModel> = this.schema.personFields.personDateOfBirth;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.personFields.personAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.personFields.personCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.personFields.personState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.personFields.personZipCode;
    public readonly sex: FieldDefinition<OptionFieldModel> = this.schema.personFields.personSex;
    public readonly race: FieldDefinition<StringFieldModel> = this.schema.personFields.personRace;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getPhoneNumber(): StringFieldModel { return this.get<StringFieldModel>(this.phoneNumber); }
    public getContributedTo(): OptionFieldModel { return this.get<OptionFieldModel>(this.contributedTo); }
    public getDateOfBirth(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfBirth); }
    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
    public getSex(): OptionFieldModel { return this.get<OptionFieldModel>(this.sex); }
    public getRace(): StringFieldModel { return this.get<StringFieldModel>(this.race); }
}
