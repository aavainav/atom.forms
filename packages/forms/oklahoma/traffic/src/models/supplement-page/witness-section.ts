import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
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
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(WitnessSectionModel);

    public readonly type: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessType;
    public readonly witnessName: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessName;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.witnessFields.witnessState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessZipCode;
    public readonly phone: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessPhone;
    public readonly socialSecurityNumber: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessSocialSecurityNumber;
    public readonly email: FieldDefinition<StringFieldModel> = this.schema.witnessFields.witnessEmail;

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
