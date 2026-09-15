import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/**
 * Represents the model for the officer boxes printed at the foot of Section III.
 *
 * The issuing officer's name field is `officerName` rather than `name`, because `SectionModel` already declares a
 * `name` holding the section's own name and a field definition cannot shadow it.
 */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(OfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerName;
    public readonly apdIdNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerApdIdNumber;
    public readonly assignment: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerAssignment;
    public readonly courtCode: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerCourtCode;
    public readonly offDays: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerOffDays;
    public readonly time: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerTime;
    public readonly secondOfficerName: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondName;
    public readonly secondApdIdNumber: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondApdIdNumber;
    public readonly secondAssignment: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondAssignment;
    public readonly secondCourtCode: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondCourtCode;
    public readonly secondOffDays: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondOffDays;
    public readonly secondTime: FieldDefinition<StringFieldModel> = this.schema.officerFields.officerSecondTime;

    public getApdIdNumber(): StringFieldModel { return this.get<StringFieldModel>(this.apdIdNumber); }
    public getAssignment(): StringFieldModel { return this.get<StringFieldModel>(this.assignment); }
    public getCourtCode(): StringFieldModel { return this.get<StringFieldModel>(this.courtCode); }
    public getOffDays(): StringFieldModel { return this.get<StringFieldModel>(this.offDays); }
    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getSecondApdIdNumber(): StringFieldModel { return this.get<StringFieldModel>(this.secondApdIdNumber); }
    public getSecondAssignment(): StringFieldModel { return this.get<StringFieldModel>(this.secondAssignment); }
    public getSecondCourtCode(): StringFieldModel { return this.get<StringFieldModel>(this.secondCourtCode); }
    public getSecondOffDays(): StringFieldModel { return this.get<StringFieldModel>(this.secondOffDays); }
    public getSecondOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.secondOfficerName); }
    public getSecondTime(): StringFieldModel { return this.get<StringFieldModel>(this.secondTime); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
}
