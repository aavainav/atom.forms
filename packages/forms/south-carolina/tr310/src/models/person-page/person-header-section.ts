import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IPersonHeaderSection extends ISection {
}

export interface IPersonHeaderSectionModel extends IPersonHeaderSection {
}

/** Represents the model for the person page's header, identifying which person of which unit the page records. */
export class PersonHeaderSectionModel extends SectionModel implements IPersonHeaderSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(PersonHeaderSectionModel);

    public readonly personNumber: FieldDefinition<StringFieldModel> = this.schema.personHeaderFields.personHeaderPersonNumber;
    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.schema.personHeaderFields.personHeaderUnitNumber;
    public readonly personType: FieldDefinition<OptionFieldModel> = this.schema.personHeaderFields.personHeaderPersonType;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.schema.personHeaderFields.personHeaderCrashReportNumber;

    public getPersonNumber(): StringFieldModel { return this.get<StringFieldModel>(this.personNumber); }
    public getUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.unitNumber); }
    public getPersonType(): OptionFieldModel { return this.get<OptionFieldModel>(this.personType); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
}
