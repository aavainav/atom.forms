import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IUnitHeaderSection extends ISection {
}

export interface IUnitHeaderSectionModel extends IUnitHeaderSection {
}

/** Represents the model for the unit page's header, identifying which unit the page records. */
export class UnitHeaderSectionModel extends SectionModel implements IUnitHeaderSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.formSchema.unitHeaderFields.unitHeaderUnitNumber;
    public readonly fr10Number: FieldDefinition<StringFieldModel> = this.formSchema.unitHeaderFields.unitHeaderFr10Number;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.formSchema.unitHeaderFields.unitHeaderCrashReportNumber;

    public getUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.unitNumber); }
    public getFr10Number(): StringFieldModel { return this.get<StringFieldModel>(this.fr10Number); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
}
