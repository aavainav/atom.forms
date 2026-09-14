import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IPleaSection extends ISection {
}

export interface IPleaSectionModel extends IPleaSection {
}

/**
 * Represents the model for the "Appearance, Plea of Guilty and Waiver" block of the court's copy.
 *
 * The minimum and maximum punishments are held as strings rather than numbers: the paper prints each as a blank
 * inside a sentence, and a court that leaves one unfilled means unstated rather than zero.
 *
 * The accused and the judge are `accusedName` and `judgeName` rather than `name`, which `SectionModel` already
 * declares for the section's own name.
 */
export class PleaSectionModel extends SectionModel implements IPleaSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly accusedName: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaAccusedName;
    public readonly chargedWith: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaChargedWith;
    public readonly minimumMonths: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaMinimumMonths;
    public readonly minimumFine: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaMinimumFine;
    public readonly maximumMonths: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaMaximumMonths;
    public readonly maximumFine: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaMaximumFine;
    public readonly day: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaDay;
    public readonly month: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaMonth;
    public readonly year: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaYear;
    public readonly accusedSignature: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaAccusedSignature;
    public readonly judgeName: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaJudgeName;
    public readonly judgeSignature: FieldDefinition<StringFieldModel> = this.formSchema.pleaFields.pleaJudgeSignature;

    public getAccusedName(): StringFieldModel { return this.get<StringFieldModel>(this.accusedName); }
    public getAccusedSignature(): StringFieldModel { return this.get<StringFieldModel>(this.accusedSignature); }
    public getChargedWith(): StringFieldModel { return this.get<StringFieldModel>(this.chargedWith); }
    public getDay(): StringFieldModel { return this.get<StringFieldModel>(this.day); }
    public getJudgeName(): StringFieldModel { return this.get<StringFieldModel>(this.judgeName); }
    public getJudgeSignature(): StringFieldModel { return this.get<StringFieldModel>(this.judgeSignature); }
    public getMaximumFine(): StringFieldModel { return this.get<StringFieldModel>(this.maximumFine); }
    public getMaximumMonths(): StringFieldModel { return this.get<StringFieldModel>(this.maximumMonths); }
    public getMinimumFine(): StringFieldModel { return this.get<StringFieldModel>(this.minimumFine); }
    public getMinimumMonths(): StringFieldModel { return this.get<StringFieldModel>(this.minimumMonths); }
    public getMonth(): StringFieldModel { return this.get<StringFieldModel>(this.month); }
    public getYear(): StringFieldModel { return this.get<StringFieldModel>(this.year); }
}
