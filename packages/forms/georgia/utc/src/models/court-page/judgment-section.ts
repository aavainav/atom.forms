import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IJudgmentSection extends ISection {
}

export interface IJudgmentSectionModel extends IJudgmentSection {
}

/**
 * Represents the model for the "Upon Trial, the Defendant is Adjudged" block at the foot of the court's copy.
 *
 * The confinement term is one box on paper, printed as "for a term of ____ (days) (months)" with the unit circled
 * rather than entered, so it is held as the single string the court writes.
 */
export class JudgmentSectionModel extends SectionModel implements IJudgmentSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(GAUTCFormSchema);

    public readonly fineAmount: FieldDefinition<StringFieldModel> = this.schema.judgmentFields.judgmentFineAmount;
    public readonly confinementTerm: FieldDefinition<StringFieldModel> = this.schema.judgmentFields.judgmentConfinementTerm;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.judgmentFields.judgmentDate;
    public readonly judgeSignature: FieldDefinition<StringFieldModel> = this.schema.judgmentFields.judgmentJudgeSignature;
    public readonly appealBond: FieldDefinition<StringFieldModel> = this.schema.judgmentFields.judgmentAppealBond;

    public getAppealBond(): StringFieldModel { return this.get<StringFieldModel>(this.appealBond); }
    public getConfinementTerm(): StringFieldModel { return this.get<StringFieldModel>(this.confinementTerm); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getFineAmount(): StringFieldModel { return this.get<StringFieldModel>(this.fineAmount); }
    public getJudgeSignature(): StringFieldModel { return this.get<StringFieldModel>(this.judgeSignature); }
}
