import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeSection extends ISection {
}

export interface INarrativeSectionModel extends INarrativeSection {
}

/** Represents the model for the officer's narrative and the notes explaining an amendment or correction. */
export class NarrativeSectionModel extends SectionModel implements INarrativeSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(NarrativeSectionModel);

    public readonly text: FieldDefinition<StringFieldModel> = this.schema.narrativeFields.narrativeText;
    public readonly amendedOrCorrectedNotes: FieldDefinition<StringFieldModel> = this.schema.narrativeFields.narrativeAmendedOrCorrectedNotes;

    public getText(): StringFieldModel { return this.get<StringFieldModel>(this.text); }
    public getAmendedOrCorrectedNotes(): StringFieldModel { return this.get<StringFieldModel>(this.amendedOrCorrectedNotes); }
}
