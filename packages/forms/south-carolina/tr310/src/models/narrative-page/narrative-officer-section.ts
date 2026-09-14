import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeOfficerSection extends ISection {
}

export interface INarrativeOfficerSectionModel extends INarrativeOfficerSection {
}

/** Represents the model for the narrative page's officer footer. */
export class NarrativeOfficerSectionModel extends SectionModel implements INarrativeOfficerSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.narrativeOfficerFields.narrativeOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.formSchema.narrativeOfficerFields.narrativeOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.formSchema.narrativeOfficerFields.narrativeOfficerCjaNumber;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.formSchema.narrativeOfficerFields.narrativeOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}
