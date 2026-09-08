import { 
    ISection,
    FieldDefinition,
    FormModel, 
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IArrestingOfficerSection extends ISection {
}

export interface IArrestingOfficerSectionModel extends IArrestingOfficerSection {
}

/** Represents the model for the arresting officer section of the s438 form's front page. */
export class ArrestingOfficerSectionModel extends SectionModel implements IArrestingOfficerSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerName;
    public readonly officerRank: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerRank;
    public readonly sccjaOfficerNumber: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerSccjaOfficerNumber;
    public readonly bailDeposited: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerBailDeposited;
    public readonly dateOfArrest: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerDateOfArrest;
    public readonly bondAmountRequested: FieldDefinition<StringFieldModel> = this.schema.arrestingOfficerFields.arrestingOfficerBondAmountRequested;
    
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getOfficerRank(): StringFieldModel { return this.get<StringFieldModel>(this.officerRank); }
    public getSccjaOfficerNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sccjaOfficerNumber); }
    public getBailDeposited(): StringFieldModel { return this.get<StringFieldModel>(this.bailDeposited); }
    public getDateOfArrest(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfArrest); }
    public getBondAmountRequested(): StringFieldModel { return this.get<StringFieldModel>(this.bondAmountRequested); }
} 