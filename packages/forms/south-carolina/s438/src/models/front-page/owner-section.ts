import { 
    ISection,
    FieldDefinition,
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IOwnerSection extends ISection {
}

export interface IOwnerSectionModel extends IOwnerSection {
}

/** Represents the model for the owner section of the s438 form's front page. */
export class OwnerSectionModel extends SectionModel implements IOwnerSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerLastName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerStreetAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.ownerFields.ownerZipCode;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
} 