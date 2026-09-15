import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeOfficerSection extends ISection {
}

export interface INarrativeOfficerSectionModel extends INarrativeOfficerSection {
}

/** Represents the model for the narrative page's officer footer. */
export class NarrativeOfficerSectionModel extends SectionModel implements INarrativeOfficerSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(NarrativeOfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.narrativeOfficerFields.narrativeOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.schema.narrativeOfficerFields.narrativeOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.schema.narrativeOfficerFields.narrativeOfficerCjaNumber;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.schema.narrativeOfficerFields.narrativeOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}
