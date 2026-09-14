import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
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
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerLastName;
    public readonly suffix: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerSuffix;
    public readonly address: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.registeredOwnerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.registeredOwnerFields.ownerZipCode;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getSuffix(): StringFieldModel { return this.get<StringFieldModel>(this.suffix); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
