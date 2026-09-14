import { 
    ISection,
    FieldDefinition,
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IArrestingOfficerSection extends ISection {
}

export interface IArrestingOfficerSectionModel extends IArrestingOfficerSection {
}

/** Represents the model for the arresting officer section of the s438 form's front page. */
export class ArrestingOfficerSectionModel extends SectionModel implements IArrestingOfficerSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerName;
    public readonly officerRank: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerRank;
    public readonly sccjaOfficerNumber: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerSccjaOfficerNumber;
    public readonly bailDeposited: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerBailDeposited;
    public readonly dateOfArrest: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerDateOfArrest;
    public readonly bondAmountRequested: FieldDefinition<StringFieldModel> = this.formSchema.arrestingOfficerFields.arrestingOfficerBondAmountRequested;
    
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getOfficerRank(): StringFieldModel { return this.get<StringFieldModel>(this.officerRank); }
    public getSccjaOfficerNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sccjaOfficerNumber); }
    public getBailDeposited(): StringFieldModel { return this.get<StringFieldModel>(this.bailDeposited); }
    public getDateOfArrest(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfArrest); }
    public getBondAmountRequested(): StringFieldModel { return this.get<StringFieldModel>(this.bondAmountRequested); }
} 