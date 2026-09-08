import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../../public-contact-or-warning-form-schema";
import { RecordPageModel } from "../record-page";
import { PersonSectionModel } from "../person-section";

export interface IRecordPagePersonDropzone extends IPersonDropzone {
}

/** Represents the dropzone for importing person data onto the public contact/warning record's person section. */
export class RecordPagePersonDropzone extends PersonDropzone implements IRecordPagePersonDropzone {
    constructor(page: RecordPageModel, schema: PublicContactOrWarningFormSchema) {
        super(
            page,
            page.get<PersonSectionModel>(schema.personSection),
            page.get<PersonSectionModel>(schema.personSection).getFirstName(),
            page.get<PersonSectionModel>(schema.personSection).getMiddleInitial(),
            page.get<PersonSectionModel>(schema.personSection).getLastName(),
        );
    }
}
