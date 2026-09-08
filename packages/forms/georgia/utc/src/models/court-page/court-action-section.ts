import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface ICourtActionSection extends ISection {
}

export interface ICourtActionSectionModel extends ICourtActionSection {
}

/**
 * Represents the model for the "Court Action and Other Orders" block at the head of the court's copy.
 *
 * Every box in this block is a write-in line on paper, including the ones that read as yes/no questions - the
 * clerk writes a date or a note on the warrant issued and served lines rather than ticking them - so all of them
 * are string fields.
 */
export class CourtActionSectionModel extends SectionModel implements ICourtActionSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormSchema);

    public readonly date: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionDate;
    public readonly complaintFiled: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionComplaintFiled;
    public readonly bailFixed: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionBailFixed;
    public readonly cashDeposit: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionCashDeposit;
    public readonly bailTakenBySignature: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionBailTakenBySignature;
    public readonly bailGivenBySignature: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionBailGivenBySignature;
    public readonly fineAmount: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionFineAmount;
    public readonly clerkSignature: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionClerkSignature;
    public readonly firstContinuance: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionFirstContinuance;
    public readonly firstContinuanceReason: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionFirstContinuanceReason;
    public readonly secondContinuance: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionSecondContinuance;
    public readonly secondContinuanceReason: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionSecondContinuanceReason;
    public readonly warrantIssued: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionWarrantIssued;
    public readonly warrantServed: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionWarrantServed;
    public readonly waivesTrialByJury: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionWaivesTrialByJury;
    public readonly arraignmentPlea: FieldDefinition<StringFieldModel> = this.schema.courtActionFields.courtActionArraignmentPlea;

    public getArraignmentPlea(): StringFieldModel { return this.get<StringFieldModel>(this.arraignmentPlea); }
    public getBailFixed(): StringFieldModel { return this.get<StringFieldModel>(this.bailFixed); }
    public getBailGivenBySignature(): StringFieldModel { return this.get<StringFieldModel>(this.bailGivenBySignature); }
    public getBailTakenBySignature(): StringFieldModel { return this.get<StringFieldModel>(this.bailTakenBySignature); }
    public getCashDeposit(): StringFieldModel { return this.get<StringFieldModel>(this.cashDeposit); }
    public getClerkSignature(): StringFieldModel { return this.get<StringFieldModel>(this.clerkSignature); }
    public getComplaintFiled(): StringFieldModel { return this.get<StringFieldModel>(this.complaintFiled); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getFineAmount(): StringFieldModel { return this.get<StringFieldModel>(this.fineAmount); }
    public getFirstContinuance(): StringFieldModel { return this.get<StringFieldModel>(this.firstContinuance); }
    public getFirstContinuanceReason(): StringFieldModel { return this.get<StringFieldModel>(this.firstContinuanceReason); }
    public getSecondContinuance(): StringFieldModel { return this.get<StringFieldModel>(this.secondContinuance); }
    public getSecondContinuanceReason(): StringFieldModel { return this.get<StringFieldModel>(this.secondContinuanceReason); }
    public getWaivesTrialByJury(): StringFieldModel { return this.get<StringFieldModel>(this.waivesTrialByJury); }
    public getWarrantIssued(): StringFieldModel { return this.get<StringFieldModel>(this.warrantIssued); }
    public getWarrantServed(): StringFieldModel { return this.get<StringFieldModel>(this.warrantServed); }
}
