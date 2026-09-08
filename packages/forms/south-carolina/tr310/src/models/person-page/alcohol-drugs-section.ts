import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IAlcoholDrugsSection extends ISection {
}

export interface IAlcoholDrugsSectionModel extends IAlcoholDrugsSection {
}

/** Represents the model for what the officer suspected the person had used and what the alcohol and drug tests found. */
export class AlcoholDrugsSectionModel extends SectionModel implements IAlcoholDrugsSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly suspectedUse: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsSuspectedUse;
    public readonly alcoholTestStatus: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsAlcoholTestStatus;
    public readonly alcoholTestType: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsAlcoholTestType;
    public readonly bloodAlcoholContent: FieldDefinition<StringFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsBloodAlcoholContent;
    public readonly drugTestStatus: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsDrugTestStatus;
    public readonly drugTestType: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsDrugTestType;
    public readonly drugTestResult: FieldDefinition<OptionFieldModel> = this.schema.alcoholDrugsFields.alcoholDrugsDrugTestResult;

    public getSuspectedUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.suspectedUse); }
    public getAlcoholTestStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.alcoholTestStatus); }
    public getAlcoholTestType(): OptionFieldModel { return this.get<OptionFieldModel>(this.alcoholTestType); }
    public getBloodAlcoholContent(): StringFieldModel { return this.get<StringFieldModel>(this.bloodAlcoholContent); }
    public getDrugTestStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.drugTestStatus); }
    public getDrugTestType(): OptionFieldModel { return this.get<OptionFieldModel>(this.drugTestType); }
    public getDrugTestResult(): OptionFieldModel { return this.get<OptionFieldModel>(this.drugTestResult); }
}
