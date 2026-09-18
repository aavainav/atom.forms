import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/** Model for the officer section of the complaint page. The issuing officer's name field is `officerName`, not `name`, since `SectionModel` already declares `name` for the section's own name. */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OfficerSectionModel);

    public readonly complainantSignature: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerComplainantSignature;
    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerName;
    public readonly commissionNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerCommissionNumber;
    public readonly bodyWornCamera: FieldDefinition<OptionFieldModel> = this.schema.officerFields.officerBodyWornCamera;
    public readonly secondOfficerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondName;
    public readonly secondCommissionNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondCommissionNumber;
    public readonly secondBodyWornCamera: FieldDefinition<OptionFieldModel> = this.schema.officerFields.officerSecondBodyWornCamera;

    public getBodyWornCamera(): OptionFieldModel { return this.get<OptionFieldModel>(this.bodyWornCamera); }
    public getCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.commissionNumber); }
    public getComplainantSignature(): StringFieldModel { return this.get<StringFieldModel>(this.complainantSignature); }
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getSecondBodyWornCamera(): OptionFieldModel { return this.get<OptionFieldModel>(this.secondBodyWornCamera); }
    public getSecondCommissionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.secondCommissionNumber); }
    public getSecondOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.secondOfficerName); }
}
