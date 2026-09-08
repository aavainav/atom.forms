import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IStopSection extends ISection {
}

export interface IStopSectionModel extends IStopSection {
}

/** Represents the model for the stop section (CTY/Date/Time/CAD Call Number) of the public contact/warning record. */
export class StopSectionModel extends SectionModel implements IStopSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormSchema);

    public readonly county: FieldDefinition<OptionFieldModel> = this.schema.stopFields.stopCounty;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.stopFields.stopDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.schema.stopFields.stopTime;
    public readonly cadCallNumber: FieldDefinition<StringFieldModel> = this.schema.stopFields.stopCadCallNumber;

    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
    public getCadCallNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cadCallNumber); }
}
