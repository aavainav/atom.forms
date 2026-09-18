import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { DefendantSectionModel } from "../defendant-section";

export interface IComplaintPageDefendantDropzone extends IPersonDropzone {
}

/**
 * Dropzone for defendant data onto the complaint page. State is left out despite the section carrying one: a
 * dropped person's state arrives as a name with no code, while the section holds an option field from the state
 * value list. It stays picked rather than dropped until there's reason to resolve it, like the vehicle's make.
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
