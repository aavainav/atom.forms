import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface INotesSection extends ISection {
}

export interface INotesSectionModel extends INotesSection {
}

/** Represents the model for the officer notes on the traffic citation form's supplement page. */
export class NotesSectionModel extends SectionModel implements INotesSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(NotesSectionModel);

    public readonly officerNotes: FieldDefinition<StringFieldModel> = this.schema.notesFields.notesOfficerNotes;

    public getOfficerNotes(): StringFieldModel { return this.get<StringFieldModel>(this.officerNotes); }
}
