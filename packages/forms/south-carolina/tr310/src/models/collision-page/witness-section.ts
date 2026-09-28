import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IWitnessSection extends ISection {
}

export interface IWitnessSectionModel extends IWitnessSection {
}

/** Represents the model for one witness or property owner row. The collision page carries a fixed three of these, matching the three rows the paper form prints; a section collection instantiates one independent instance per row. */
export class WitnessSectionModel extends SectionModel implements IWitnessSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(WitnessSectionModel);

    public readonly type: FieldDefinition<StringFieldModel> = this.schema.witnessFields.type;
    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.witnessFields.firstName;
    public readonly middleInitial: FieldDefinition<StringFieldModel> = this.schema.witnessFields.middleInitial;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.witnessFields.lastName;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.witnessFields.address;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.witnessFields.city;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.witnessFields.state;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.witnessFields.zipCode;
    public readonly telephone: FieldDefinition<StringFieldModel> = this.schema.witnessFields.telephone;
    public readonly propertyDamageAmount: FieldDefinition<StringFieldModel> = this.schema.witnessFields.propertyDamageAmount;
    public readonly propertyDamageDescription: FieldDefinition<StringFieldModel> = this.schema.witnessFields.propertyDamageDescription;

    public getType(): StringFieldModel { return this.get<StringFieldModel>(this.type); }
    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleInitial(): StringFieldModel { return this.get<StringFieldModel>(this.middleInitial); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
    public getTelephone(): StringFieldModel { return this.get<StringFieldModel>(this.telephone); }
    public getPropertyDamageAmount(): StringFieldModel { return this.get<StringFieldModel>(this.propertyDamageAmount); }
    public getPropertyDamageDescription(): StringFieldModel { return this.get<StringFieldModel>(this.propertyDamageDescription); }
}
