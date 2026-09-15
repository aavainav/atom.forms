import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IOwnerSection extends ISection {
}

export interface IOwnerSectionModel extends IOwnerSection {
}

/** Represents the model for the unit's registered owner. The form prints one name box; the name is held as three fields so a person dropped onto the section lands in the right part of it. */
export class OwnerSectionModel extends SectionModel implements IOwnerSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(OwnerSectionModel);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerLastName;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.ownerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerZipCode;
    public readonly driverLicenseNumber: FieldDefinition<StringFieldModel> = this.schema.ownerFields.ownerDriverLicenseNumber;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
    public getDriverLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.driverLicenseNumber); }
}
