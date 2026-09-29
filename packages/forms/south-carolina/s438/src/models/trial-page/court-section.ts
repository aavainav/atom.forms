import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialCourtSection extends ISection {
}

export interface ITrialCourtSectionModel extends ITrialCourtSection {
}

/** Represents the model for the court section of the s438 form's trial page. */
export class TrialCourtSectionModel extends SectionModel implements ITrialCourtSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialCourtSectionModel);

    public readonly courtName: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtStreetAddress;
    public readonly dateOfTrial: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtDateOfTrial;
    public readonly timeOfTrial: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtTimeOfTrial;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.trialCourtFields.trialCourtZipCode;

    public getCourtName(): StringFieldModel { return this.get<StringFieldModel>(this.courtName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getDateOfTrial(): StringFieldModel { return this.get<StringFieldModel>(this.dateOfTrial); }
    public getTimeOfTrial(): StringFieldModel { return this.get<StringFieldModel>(this.timeOfTrial); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
