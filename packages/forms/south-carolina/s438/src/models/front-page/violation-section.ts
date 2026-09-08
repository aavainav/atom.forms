import { 
    ISection,
    BooleanFieldModel,
    FieldDefinition,
    FormModel, 
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
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

    public readonly sectionNumber: FieldDefinition<StringFieldModel> = this.schema.violationFields.violationSectionNumber;
    public readonly description: FieldDefinition<StringFieldModel> = this.schema.violationFields.violationDescription;
    public readonly courtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel> = this.schema.violationFields.violationCourtAppearanceRequiredYes;
    public readonly courtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel> = this.schema.violationFields.violationCourtAppearanceRequiredNo;
    public readonly dateOfViolation: FieldDefinition<StringFieldModel> = this.schema.violationFields.violationDateOfViolation;
    public readonly timeOfViolation: FieldDefinition<StringFieldModel> = this.schema.violationFields.violationTimeOfViolation;
    public readonly scPoints: FieldDefinition<NumberFieldModel> = this.schema.violationFields.violationScPoints;
    public readonly bloodAlcoholLevel: FieldDefinition<StringFieldModel> = this.schema.violationFields.violationBloodAlcoholLevel;

    public getSectionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sectionNumber); }
    public getDescription(): StringFieldModel { return this.get<StringFieldModel>(this.description); }
    public getCourtAppearanceRequiredYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredYes); }
    public getCourtAppearanceRequiredNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredNo); }
    public getDateOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfViolation); }
    public getTimeOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.timeOfViolation); }
    public getScPoints(): NumberFieldModel { return this.get<NumberFieldModel>(this.scPoints); }
    public getBloodAlcoholLevel(): StringFieldModel { return this.get<StringFieldModel>(this.bloodAlcoholLevel); }
}