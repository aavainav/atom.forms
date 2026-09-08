import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { DefendantSectionModel } from "../defendant-section";

export interface IComplaintPageDefendantDropzone extends IPersonDropzone {
}

/**
 * Represents the dropzone for importing defendant data onto the traffic citation form's complaint page.
 *
 * The state is left out of the mapping even though the section carries one: a dropped person's state arrives as a
 * name with no code, and the section holds it as an option field drawn from the state value list. The defendant's
 * state is picked rather than dropped until there is a reason to resolve it, as the vehicle's make is.
 */
export class ComplaintPageDefendantDropzone extends PersonDropzone implements IComplaintPageDefendantDropzone {
    constructor(page: ComplaintPageModel, schema: OKTrafficFormSchema) {
        super(
            page,
            page.get<DefendantSectionModel>(schema.defendantSection),
            page.get<DefendantSectionModel>(schema.defendantSection).getFirstName(),
            page.get<DefendantSectionModel>(schema.defendantSection).getMiddleName(),
            page.get<DefendantSectionModel>(schema.defendantSection).getLastName(),
            page.get<DefendantSectionModel>(schema.defendantSection).getAddress(),
            page.get<DefendantSectionModel>(schema.defendantSection).getCity(),
            undefined,
            page.get<DefendantSectionModel>(schema.defendantSection).getZipCode()
        );
    }
}
