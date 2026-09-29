import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialOwnerSection extends ISection {
}

export interface ITrialOwnerSectionModel extends ITrialOwnerSection {
}

/** Represents the model for the owner section of the s438 form's trial page. */
export class TrialOwnerSectionModel extends SectionModel implements ITrialOwnerSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialOwnerSectionModel);

    public readonly firstName: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerFirstName;
    public readonly middleName: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerMiddleName;
    public readonly lastName: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerLastName;
    public readonly streetAddress: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerStreetAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerCity;
    public readonly state: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.trialOwnerFields.trialOwnerZipCode;

    public getFirstName(): StringFieldModel { return this.get<StringFieldModel>(this.firstName); }
    public getMiddleName(): StringFieldModel { return this.get<StringFieldModel>(this.middleName); }
    public getLastName(): StringFieldModel { return this.get<StringFieldModel>(this.lastName); }
    public getStreetAddress(): StringFieldModel { return this.get<StringFieldModel>(this.streetAddress); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getState(): StringFieldModel { return this.get<StringFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
