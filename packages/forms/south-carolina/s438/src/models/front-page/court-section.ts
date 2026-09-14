import { 
    ISection,
    FieldDefinition,
    SectionModel, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ICourtSection extends ISection {
}

export interface ICourtSectionModel extends ICourtSection {
}

/** Represents the model for the court section of the s438 form's front page. */
export class CourtSectionModel extends SectionModel implements ICourtSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly courtName: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtStreetAddress;
    public readonly dateOfTrial: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtDateOfTrial;
    public readonly timeOfTrial: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtTimeOfTrial;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.formSchema.courtFields.courtZipCode;

    public getCourtName(): StringFieldModel { return this.get<StringFieldModel>(this.courtName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getDateOfTrial(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfTrial); }
    public getTimeOfTrial(): StringFieldModel { return this.get<StringFieldModel>(this.timeOfTrial); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
} 