import { 
    ISection,
    BooleanFieldModel,
    FieldDefinition,
    NumberFieldModel, 
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IViolationSection extends ISection {
}

export interface IViolationSectionModel extends IViolationSection {
}

/** Represents the model for the violation section of the s438 form's front page. */
export class ViolationSectionModel extends SectionModel implements IViolationSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly sectionNumber: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationSectionNumber;
    public readonly description: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationDescription;
    public readonly courtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationCourtAppearanceRequiredYes;
    public readonly courtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel> = this.formSchema.violationFields.violationCourtAppearanceRequiredNo;
    public readonly dateOfViolation: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationDateOfViolation;
    public readonly timeOfViolation: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationTimeOfViolation;
    public readonly scPoints: FieldDefinition<NumberFieldModel> = this.formSchema.violationFields.violationScPoints;
    public readonly bloodAlcoholLevel: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationBloodAlcoholLevel;

    public getSectionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sectionNumber); }
    public getDescription(): StringFieldModel { return this.get<StringFieldModel>(this.description); }
    public getCourtAppearanceRequiredYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredYes); }
    public getCourtAppearanceRequiredNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredNo); }
    public getDateOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfViolation); }
    public getTimeOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.timeOfViolation); }
    public getScPoints(): NumberFieldModel { return this.get<NumberFieldModel>(this.scPoints); }
    public getBloodAlcoholLevel(): StringFieldModel { return this.get<StringFieldModel>(this.bloodAlcoholLevel); }
}