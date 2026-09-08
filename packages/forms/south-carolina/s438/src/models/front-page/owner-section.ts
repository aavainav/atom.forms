import { 
    ISection,
    FieldDefinition,
    FormModel,
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IOwnerSection extends ISection {
}

export interface IOwnerSectionModel extends IOwnerSection {
}

/** Represents the model for the owner section of the s438 form's front page. */
export class OwnerSectionModel extends SectionModel implements IOwnerSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerLastName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerStreetAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerZipCode;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
} 