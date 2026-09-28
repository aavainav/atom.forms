import { FieldDefinition, FormModel, HiddenFieldModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IUnitHeaderSection extends ISection {
}

export interface IUnitHeaderSectionModel extends IUnitHeaderSection {
}

/** Represents the model for the unit page's header, identifying which unit the page records. */
export class UnitHeaderSectionModel extends SectionModel implements IUnitHeaderSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(UnitHeaderSectionModel);

    public readonly unitNumber: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderUnitNumber;
    public readonly fr10Number: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderFr10Number;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.schema.unitHeaderFields.unitHeaderCrashReportNumber;
    /** Identifies this unit page across saves. Hidden -- no component binds to it. */
    public readonly unitId: FieldDefinition<HiddenFieldModel> = this.schema.unitHeaderFields.unitHeaderUnitId;

    public getUnitNumber(): StringFieldModel { return this.get<StringFieldModel>(this.unitNumber); }
    public getFr10Number(): StringFieldModel { return this.get<StringFieldModel>(this.fr10Number); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
    public getUnitId(): HiddenFieldModel { return this.get<HiddenFieldModel>(this.unitId); }
}
