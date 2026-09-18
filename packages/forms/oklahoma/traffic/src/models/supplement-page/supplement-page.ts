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

/** The supplement page. The registered owner is a single name box here, not the first/middle/last the complaint page carries, so this page registers no person dropzone -- a dropped name would lose the distinction between its parts. */
export class SupplementPageModel extends PageModel implements ISupplementPageModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(SupplementPageModel);

    public readonly witnessSection: SectionDefinition<WitnessSectionModel> = this.schema.witnessSection;
    public readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel> = this.schema.registeredOwnerSection;
    public readonly statusSection: SectionDefinition<StatusSectionModel> = this.schema.statusSection;
    public readonly notesSection: SectionDefinition<NotesSectionModel> = this.schema.notesSection;

    public getNotesSection(): NotesSectionModel { return this.get<NotesSectionModel>(this.notesSection); }
    public getRegisteredOwnerSection(): RegisteredOwnerSectionModel { return this.get<RegisteredOwnerSectionModel>(this.registeredOwnerSection); }
    public getStatusSection(): StatusSectionModel { return this.get<StatusSectionModel>(this.statusSection); }
    public getWitnessSection(): WitnessSectionModel { return this.get<WitnessSectionModel>(this.witnessSection); }
}
