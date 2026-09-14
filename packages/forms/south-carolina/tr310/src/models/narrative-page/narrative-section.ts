import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface INarrativeSection extends ISection {
}

export interface INarrativeSectionModel extends INarrativeSection {
}

/** Represents the model for the officer's narrative and the notes explaining an amendment or correction. */
export class NarrativeSectionModel extends SectionModel implements INarrativeSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly text: FieldDefinition<StringFieldModel> = this.formSchema.narrativeFields.narrativeText;
    public readonly amendedOrCorrectedNotes: FieldDefinition<StringFieldModel> = this.formSchema.narrativeFields.narrativeAmendedOrCorrectedNotes;

    public getText(): StringFieldModel { return this.get<StringFieldModel>(this.text); }
    public getAmendedOrCorrectedNotes(): StringFieldModel { return this.get<StringFieldModel>(this.amendedOrCorrectedNotes); }
}
