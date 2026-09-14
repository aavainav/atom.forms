import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IDefendantSection extends ISection {
}

export interface IDefendantSectionModel extends IDefendantSection {
}

/** Represents the model for the defendant section of the traffic citation form's complaint page. */
export class DefendantSectionModel extends SectionModel implements IDefendantSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly lastName: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantLastName;
    public readonly firstName: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantMiddleName;
    public readonly address: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.defendantFields.defendantState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.defendantFields.defendantZipCode;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
