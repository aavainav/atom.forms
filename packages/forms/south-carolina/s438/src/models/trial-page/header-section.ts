import { BooleanFieldModel, FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialHeaderSection extends ISection {
}

export interface ITrialHeaderSectionModel extends ITrialHeaderSection {
}

/** Represents the model for the header section of the s438 form's trial page. */
export class TrialHeaderSectionModel extends SectionModel implements ITrialHeaderSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialHeaderSectionModel);

    public readonly notes: FieldDefinition<StringFieldModel> = this.schema.trialHeaderFields.trialHeaderNotes;
    public readonly void: FieldDefinition<BooleanFieldModel> = this.schema.trialHeaderFields.trialHeaderVoid;

    public getNotes(): StringFieldModel { return this.get<StringFieldModel>(this.notes); }
    public getVoid(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.void); }
}
