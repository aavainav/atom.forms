import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeHeaderSection extends ISection {
}

export interface INarrativeHeaderSectionModel extends INarrativeHeaderSection {
}

/** Represents the model for the narrative page's header. */
export class NarrativeHeaderSectionModel extends SectionModel implements INarrativeHeaderSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(NarrativeHeaderSectionModel);

    public readonly internalAgencyCode: FieldDefinition<StringFieldModel> = this.schema.narrativeHeaderFields.narrativeHeaderInternalAgencyCode;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.schema.narrativeHeaderFields.narrativeHeaderCrashReportNumber;

    public getInternalAgencyCode(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgencyCode); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
}
