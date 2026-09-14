import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IViolationSection extends ISection {
}

export interface IViolationSectionModel extends IViolationSection {
}

/** Represents the model for the violation section of the parking citation page. */
export class ViolationSectionModel extends SectionModel implements IViolationSectionModel {
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly date: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationTime;
    public readonly location: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationLocation;
    public readonly code: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationCode;
    public readonly description: FieldDefinition<StringFieldModel> = this.formSchema.violationFields.violationDescription;

    public getCode(): StringFieldModel { return this.get<StringFieldModel>(this.code); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getDescription(): StringFieldModel { return this.get<StringFieldModel>(this.description); }
    public getLocation(): StringFieldModel { return this.get<StringFieldModel>(this.location); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
}
