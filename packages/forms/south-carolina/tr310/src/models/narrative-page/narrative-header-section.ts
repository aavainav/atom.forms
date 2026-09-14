import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeHeaderSection extends ISection {
}

export interface INarrativeHeaderSectionModel extends INarrativeHeaderSection {
}

/** Represents the model for the narrative page's header. */
export class NarrativeHeaderSectionModel extends SectionModel implements INarrativeHeaderSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly internalAgencyCode: FieldDefinition<StringFieldModel> = this.formSchema.narrativeHeaderFields.narrativeHeaderInternalAgencyCode;
    public readonly crashReportNumber: FieldDefinition<StringFieldModel> = this.formSchema.narrativeHeaderFields.narrativeHeaderCrashReportNumber;

    public getInternalAgencyCode(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgencyCode); }
    public getCrashReportNumber(): StringFieldModel { return this.get<StringFieldModel>(this.crashReportNumber); }
}
