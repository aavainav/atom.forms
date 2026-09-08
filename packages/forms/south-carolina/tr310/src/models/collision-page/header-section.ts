import { ISection, FieldDefinition, FormModel, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IHeaderSection extends ISection {
}

export interface IHeaderSectionModel extends IHeaderSection {
}

/** Represents the model for the header of the TR-310, carrying the page and version numbering and the times the report records. */
export class HeaderSectionModel extends SectionModel implements IHeaderSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly pageNumber: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerPageNumber;
    public readonly pageCount: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerPageCount;
    public readonly version: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerVersion;
    public readonly unitCount: FieldDefinition<NumberFieldModel> = this.schema.headerFields.headerUnitCount;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerCrashReportNumber;
    public readonly amended: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerAmended;
    public readonly corrected: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerCorrected;
    public readonly officerNotified: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerOfficerNotified;
    public readonly officerArrived: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerOfficerArrived;
    public readonly roadwayCleared: FieldDefinition<StringFieldModel> = this.schema.headerFields.headerRoadwayCleared;

    public getPageNumber(): StringFieldModel { return this.get<StringFieldModel>(this.pageNumber); }
    public getPageCount(): StringFieldModel { return this.get<StringFieldModel>(this.pageCount); }
    public getVersion(): StringFieldModel { return this.get<StringFieldModel>(this.version); }
    public getUnitCount(): NumberFieldModel { return this.get<NumberFieldModel>(this.unitCount); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
    public getAmended(): StringFieldModel { return this.get<StringFieldModel>(this.amended); }
    public getCorrected(): StringFieldModel { return this.get<StringFieldModel>(this.corrected); }
    public getOfficerNotified(): StringFieldModel { return this.get<StringFieldModel>(this.officerNotified); }
    public getOfficerArrived(): StringFieldModel { return this.get<StringFieldModel>(this.officerArrived); }
    public getRoadwayCleared(): StringFieldModel { return this.get<StringFieldModel>(this.roadwayCleared); }
}
