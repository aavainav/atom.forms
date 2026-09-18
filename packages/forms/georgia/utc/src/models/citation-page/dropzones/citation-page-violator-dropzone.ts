import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { GAUTCFormSchema } from "../../utc-form-schema";
import { CitationPageModel } from "../citation-page";
import { ViolatorSectionModel } from "../violator-section";

export interface ICitationPageViolatorDropzone extends IPersonDropzone {
}

/**
 * Dropzone for violator data onto the citation page. State is left out of the mapping despite the section
 * carrying one: a dropped person's state arrives as a name with no code, while the section holds an option field
 * from the state value list. It stays picked rather than dropped until there's reason to resolve it, like the
 * vehicle's make.
 */
export class CitationPageViolatorDropzone extends PersonDropzone implements ICitationPageViolatorDropzone {
    constructor(page: CitationPageModel, schema: GAUTCFormSchema) {
        super(
            page,
            page.get<ViolatorSectionModel>(schema.violatorSection),
            page.get<ViolatorSectionModel>(schema.violatorSection).getFirstName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getMiddleName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getLastName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getAddress(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getCity(),
            undefined,
            page.get<ViolatorSectionModel>(schema.violatorSection).getZipCode()
        );
    }
}
