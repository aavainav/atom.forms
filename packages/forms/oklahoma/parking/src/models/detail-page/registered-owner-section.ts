import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IRegisteredOwnerSection extends ISection {
}

export interface IRegisteredOwnerSectionModel extends IRegisteredOwnerSection {
}

/**
 * Represents the model for the registered owner section of the parking violation form's detail page.
 *
 * A parking citation is written against a vehicle rather than a person, so the owner is looked up after the fact
 * and none of these fields is required for the citation to be valid.
 */
export class RegisteredOwnerSectionModel extends SectionModel implements IRegisteredOwnerSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerLastName;
    public readonly suffix: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerSuffix;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.registeredOwnerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerZipCode;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getSuffix(): StringFieldModel { return this.get<StringFieldModel>(this.suffix); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
