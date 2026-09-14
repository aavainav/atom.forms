import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
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
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly date: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionDate;
    public readonly complaintFiled: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionComplaintFiled;
    public readonly bailFixed: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionBailFixed;
    public readonly cashDeposit: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionCashDeposit;
    public readonly bailTakenBySignature: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionBailTakenBySignature;
    public readonly bailGivenBySignature: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionBailGivenBySignature;
    public readonly fineAmount: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionFineAmount;
    public readonly clerkSignature: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionClerkSignature;
    public readonly firstContinuance: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionFirstContinuance;
    public readonly firstContinuanceReason: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionFirstContinuanceReason;
    public readonly secondContinuance: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionSecondContinuance;
    public readonly secondContinuanceReason: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionSecondContinuanceReason;
    public readonly warrantIssued: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionWarrantIssued;
    public readonly warrantServed: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionWarrantServed;
    public readonly waivesTrialByJury: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionWaivesTrialByJury;
    public readonly arraignmentPlea: FieldDefinition<StringFieldModel> = this.formSchema.courtActionFields.courtActionArraignmentPlea;

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
