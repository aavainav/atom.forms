import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { TR310FormSchema } from "../../tr310-form-schema";
import { PersonPageModel } from "../person-page";
import { PersonSectionModel } from "../person-section";

export interface IPersonPagePersonDropzone extends IPersonDropzone {
}

/** Dropzone for person data onto a TR-310 person page. State is left off: the report holds it as a value-list code while the dropzone deals in string fields, so a dropped state would need resolving like the unit page's make/model -- the officer picks it instead. */
export class PersonPagePersonDropzone extends PersonDropzone implements IPersonPagePersonDropzone {
    constructor(page: PersonPageModel, schema: TR310FormSchema) {
        const section = page.get<PersonSectionModel>(schema.personSection);

        super(
            page,
            section,
            section.getFirstName(),
            section.getMiddleName(),
            section.getLastName(),
            section.getAddress(),
            section.getCity(),
            undefined,
            section.getZipCode()
        );
    }
}
