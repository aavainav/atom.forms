import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface INotesSection extends ISection {
}

export interface INotesSectionModel extends INotesSection {
}

/**
 * Represents the model for the notes section of the parking violation form's detail page.
 *
 * The printed page also carries a "Pictures" area. It holds attachments rather than values, so it is not modeled
 * here; a host that stores photographs against a citation carries them alongside this form's data.
 */
export class NotesSectionModel extends SectionModel implements INotesSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

    public readonly officerNotes: FieldDefinition<StringFieldModel> = this.schema.notesFields.notesOfficerNotes;
    public readonly offenseNotes: FieldDefinition<StringFieldModel> = this.schema.notesFields.notesOffenseNotes;

    public getOffenseNotes(): StringFieldModel { return this.get<StringFieldModel>(this.offenseNotes); }
    public getOfficerNotes(): StringFieldModel { return this.get<StringFieldModel>(this.officerNotes); }
}
