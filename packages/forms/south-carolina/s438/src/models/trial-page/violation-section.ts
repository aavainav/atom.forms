import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialViolationSection extends ISection {
}

export interface ITrialViolationSectionModel extends ITrialViolationSection {
}

/** Represents the model for the violation section of the s438 form's trial page. */
export class TrialViolationSectionModel extends SectionModel implements ITrialViolationSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialViolationSectionModel);

    public readonly sectionNumber: FieldDefinition<StringFieldModel> = this.schema.trialViolationFields.trialViolationSectionNumber;
    public readonly description: FieldDefinition<StringFieldModel> = this.schema.trialViolationFields.trialViolationDescription;
    public readonly courtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel> = this.schema.trialViolationFields.trialViolationCourtAppearanceRequiredYes;
    public readonly courtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel> = this.schema.trialViolationFields.trialViolationCourtAppearanceRequiredNo;
    public readonly dateOfViolation: FieldDefinition<StringFieldModel> = this.schema.trialViolationFields.trialViolationDateOfViolation;
    public readonly timeOfViolation: FieldDefinition<StringFieldModel> = this.schema.trialViolationFields.trialViolationTimeOfViolation;
    public readonly scPoints: FieldDefinition<NumberFieldModel> = this.schema.trialViolationFields.trialViolationScPoints;
    public readonly bloodAlcoholLevel: FieldDefinition<StringFieldModel> = this.schema.trialViolationFields.trialViolationBloodAlcoholLevel;
    public readonly speed: FieldDefinition<NumberFieldModel> = this.schema.trialViolationFields.trialViolationSpeed;
    public readonly speedLimit: FieldDefinition<NumberFieldModel> = this.schema.trialViolationFields.trialViolationSpeedLimit;

    public getSectionNumber(): StringFieldModel { return this.get<StringFieldModel>(this.sectionNumber); }
    public getDescription(): StringFieldModel { return this.get<StringFieldModel>(this.description); }
    public getCourtAppearanceRequiredYes(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredYes); }
    public getCourtAppearanceRequiredNo(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.courtAppearanceRequiredNo); }
    public getDateOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfViolation); }
    public getTimeOfViolation(): StringFieldModel { return this.get<StringFieldModel>(this.timeOfViolation); }
    public getScPoints(): NumberFieldModel { return this.get<NumberFieldModel>(this.scPoints); }
    public getBloodAlcoholLevel(): StringFieldModel { return this.get<StringFieldModel>(this.bloodAlcoholLevel); }
    public getSpeed(): NumberFieldModel { return this.get<NumberFieldModel>(this.speed); }
    public getSpeedLimit(): NumberFieldModel { return this.get<NumberFieldModel>(this.speedLimit); }
}
