import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IWitnessSection extends ISection {
}

export interface IWitnessSectionModel extends IWitnessSection {
}

/**
 * Represents the model for the witness/complainant section of the traffic citation form's supplement page.
 *
 * The witness's name field is `witnessName` rather than `name`, because `SectionModel` already declares a `name`
 * holding the section's own name and a field definition cannot shadow it.
 */
export class WitnessSectionModel extends SectionModel implements IWitnessSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly type: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessType;
    public readonly witnessName: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessName;
    public readonly address: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.witnessFields.witnessState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessZipCode;
    public readonly phone: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessPhone;
    public readonly socialSecurityNumber: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessSocialSecurityNumber;
    public readonly email: FieldDefinition<StringFieldModel> = this.formSchema.witnessFields.witnessEmail;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getEmail(): StringFieldModel { return this.get<StringFieldModel>(this.email); }
    public getPhone(): StringFieldModel { return this.get<StringFieldModel>(this.phone); }
    public getSocialSecurityNumber(): StringFieldModel { return this.get<StringFieldModel>(this.socialSecurityNumber); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getType(): StringFieldModel { return this.get<StringFieldModel>(this.type); }
    public getWitnessName(): StringFieldModel { return this.get<StringFieldModel>(this.witnessName); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
