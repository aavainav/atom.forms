import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/**
 * Represents the model for the officer section of the traffic citation form's complaint page.
 *
 * The issuing officer's name field is `officerName` rather than `name`, because `SectionModel` already declares a
 * `name` holding the section's own name and a field definition cannot shadow it.
 */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly complainantSignature: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerComplainantSignature;
    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerName;
    public readonly commissionNumber: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerCommissionNumber;
    public readonly bodyWornCamera: FieldDefinition<OptionFieldModel> = this.formSchema.officerFields.officerBodyWornCamera;
    public readonly secondOfficerName: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerSecondName;
    public readonly secondCommissionNumber: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerSecondCommissionNumber;
    public readonly secondBodyWornCamera: FieldDefinition<OptionFieldModel> = this.formSchema.officerFields.officerSecondBodyWornCamera;

    public getBodyWornCamera(): OptionFieldModel { return this.get<OptionFieldModel>(this.bodyWornCamera); }
    public getCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.commissionNumber); }
    public getComplainantSignature(): StringFieldModel { return this.get<StringFieldModel>(this.complainantSignature); }
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getSecondBodyWornCamera(): OptionFieldModel { return this.get<OptionFieldModel>(this.secondBodyWornCamera); }
    public getSecondCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.secondCommissionNumber); }
    public getSecondOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.secondOfficerName); }
}
