import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialViolationLocationSection extends ISection {
}

export interface ITrialViolationLocationSectionModel extends ITrialViolationLocationSection {
}

/** Represents the model for the violation location section of the s438 form's trial page. */
export class TrialViolationLocationSectionModel extends SectionModel implements ITrialViolationLocationSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialViolationLocationSectionModel);

    public readonly location: FieldDefinition<StringFieldModel> = this.schema.trialViolationLocationFields.trialViolationLocation;
    public readonly county: FieldDefinition<StringFieldModel> = this.schema.trialViolationLocationFields.trialViolationLocationCounty;
    public readonly latitude: FieldDefinition<StringFieldModel> = this.schema.trialViolationLocationFields.trialViolationLocationLatitude;
    public readonly longitude: FieldDefinition<StringFieldModel> = this.schema.trialViolationLocationFields.trialViolationLocationLongitude;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.trialViolationLocationFields.trialViolationLocationCity;

    public getLocation(): StringFieldModel { return this.get<StringFieldModel>(this.location); }
    public getCounty(): StringFieldModel { return this.get<StringFieldModel>(this.county); }
    public getLatitude(): StringFieldModel { return this.get<StringFieldModel>(this.latitude); }
    public getLongitude(): StringFieldModel { return this.get<StringFieldModel>(this.longitude); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
}
