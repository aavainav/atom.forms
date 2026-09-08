import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IUnitHeaderSection extends ISection {
}

export interface IUnitHeaderSectionModel extends IUnitHeaderSection {
}

/** Represents the model for the unit page's header, identifying which unit the page records. */
export class UnitHeaderSectionModel extends SectionModel implements IUnitHeaderSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderUnitNumber;
    public readonly fr10Number: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderFr10Number;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderCrashReportNumber;

    public getUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.unitNumber); }
    public getFr10Number(): StringFieldModel { return this.get<StringFieldModel>(this.fr10Number); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
}
