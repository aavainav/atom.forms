import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IJudgmentSection extends ISection {
}

export interface IJudgmentSectionModel extends IJudgmentSection {
}

/** Model for the "Upon Trial, the Defendant is Adjudged" block. The confinement term is one box, printed "for a term of ____ (days) (months)" with the unit circled rather than entered, so it's held as the single string the court writes. */
export class JudgmentSectionModel extends SectionModel implements IJudgmentSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(JudgmentSectionModel);

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
