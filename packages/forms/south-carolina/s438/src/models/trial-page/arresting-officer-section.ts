import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialArrestingOfficerSection extends ISection {
}

export interface ITrialArrestingOfficerSectionModel extends ITrialArrestingOfficerSection {
}

/** Represents the model for the arresting officer section of the s438 form's trial page, which also records when the bail was received. */
export class TrialArrestingOfficerSectionModel extends SectionModel implements ITrialArrestingOfficerSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialArrestingOfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerName;
    public readonly officerRank: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerRank;
    public readonly sccjaOfficerNumber: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerSccjaOfficerNumber;
    public readonly bailDeposited: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerBailDeposited;
    public readonly dateOfArrest: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerDateOfArrest;
    public readonly bondAmountRequested: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerBondAmountRequested;
    public readonly dateBailReceived: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerDateBailReceived;
    public readonly bailReceivedBy: FieldDefinition<StringFieldModel> = this.schema.trialArrestingOfficerFields.trialArrestingOfficerBailReceivedBy;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getOfficerRank(): StringFieldModel { return this.get<StringFieldModel>(this.officerRank); }
    public getSccjaOfficerNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sccjaOfficerNumber); }
    public getBailDeposited(): StringFieldModel { return this.get<StringFieldModel>(this.bailDeposited); }
    public getDateOfArrest(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfArrest); }
    public getBondAmountRequested(): StringFieldModel { return this.get<StringFieldModel>(this.bondAmountRequested); }
    public getDateBailReceived(): StringFieldModel { return this.get<StringFieldModel>(this.dateBailReceived); }
    public getBailReceivedBy(): StringFieldModel { return this.get<StringFieldModel>(this.bailReceivedBy); }
}
