import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface INotesSection extends ISection {
}

export interface INotesSectionModel extends INotesSection {
}

/** Model for the notes section of the detail page. The printed page also carries a "Pictures" area, holding attachments rather than values, so it's not modeled here -- a host storing photographs carries them alongside this form's data. */
export class NotesSectionModel extends SectionModel implements INotesSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(NotesSectionModel);

    public readonly officerNotes: FieldDefinition<StringFieldModel> = this.schema.notesFields.notesOfficerNotes;
    public readonly offenseNotes: FieldDefinition<StringFieldModel> = this.schema.notesFields.notesOffenseNotes;

    public getOffenseNotes(): StringFieldModel { return this.get<StringFieldModel>(this.offenseNotes); }
    public getOfficerNotes(): StringFieldModel { return this.get<StringFieldModel>(this.officerNotes); }
}
