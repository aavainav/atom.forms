import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { TR310FormSchema } from "../../tr310-form-schema";
import { PersonPageModel } from "../person-page";
import { PersonSectionModel } from "../person-section";

export interface IPersonPagePersonDropzone extends IPersonDropzone {
}

/**
 * Represents the dropzone for importing person data onto a TR-310 person page.
 *
 * The state is left off rather than passed through: the report holds it as a code chosen from a value list, and
 * the dropzone deals in string fields, so a dropped state would have to be resolved the way the unit page's make
 * and model are. The officer picks it instead.
 */
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
