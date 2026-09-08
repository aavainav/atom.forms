import { 
    ISection,
    FieldDefinition,
    FormModel, 
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IViolationLocationSection extends ISection {
}

export interface IViolationLocationSectionModel extends IViolationLocationSection {
}

/** Represents the model for the violation location section of the s438 form's front page. */
export class ViolationLocationSectionModel extends SectionModel implements IViolationLocationSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormSchema);

    public readonly violationLocation: FieldDefinition<StringFieldModel> = this.schema.violationLocationFields.violationLocation;
    public readonly violationLocationCounty: FieldDefinition<StringFieldModel> = this.schema.violationLocationFields.violationLocationCounty;
    public readonly violationLocationLatitude: FieldDefinition<StringFieldModel> = this.schema.violationLocationFields.violationLocationLatitude;
    public readonly violationLocationLongitude: FieldDefinition<StringFieldModel> = this.schema.violationLocationFields.violationLocationLongitude;
    public readonly violationLocationCity: FieldDefinition<StringFieldModel> = this.schema.violationLocationFields.violationLocationCity;

    public getLocation(): StringFieldModel { return this.get<StringFieldModel>(this.violationLocation); }
    public getCounty(): StringFieldModel { return this.get<StringFieldModel>(this.violationLocationCounty); }
    public getLatitude(): StringFieldModel { return this.get<StringFieldModel>(this.violationLocationLatitude); }
    public getLongitude(): StringFieldModel { return this.get<StringFieldModel>(this.violationLocationLongitude); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.violationLocationCity); }
} 