import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";
import { NotesSectionModel } from "./notes-section";
import { RegisteredOwnerSectionModel } from "./registered-owner-section";
import { StatusSectionModel } from "./status-section";
import { WitnessSectionModel } from "./witness-section";

export interface ISupplementPage {
}

export interface ISupplementPageModel extends ISupplementPage {
}

/**
 * Represents the supplement page of the traffic citation form.
 *
 * The registered owner is a single name box here rather than the first/middle/last the complaint page carries, so
 * the page registers no person dropzone: a dropped person's name has nowhere to land that would not lose the
 * distinction between its parts.
 */
export class SupplementPageModel extends PageModel implements ISupplementPageModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

    public readonly witnessSection: SectionDefinition<WitnessSectionModel> = this.schema.witnessSection;
    public readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel> = this.schema.registeredOwnerSection;
    public readonly statusSection: SectionDefinition<StatusSectionModel> = this.schema.statusSection;
    public readonly notesSection: SectionDefinition<NotesSectionModel> = this.schema.notesSection;

    public getNotesSection(): NotesSectionModel { return this.get<NotesSectionModel>(this.notesSection); }
    public getRegisteredOwnerSection(): RegisteredOwnerSectionModel { return this.get<RegisteredOwnerSectionModel>(this.registeredOwnerSection); }
    public getStatusSection(): StatusSectionModel { return this.get<StatusSectionModel>(this.statusSection); }
    public getWitnessSection(): WitnessSectionModel { return this.get<WitnessSectionModel>(this.witnessSection); }
}
