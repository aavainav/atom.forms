import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { OKParkingFormSchema } from "../../parking-form-schema";
import { DetailPageModel } from "../detail-page";
import { RegisteredOwnerSectionModel } from "../registered-owner-section";

export interface IDetailPageOwnerDropzone extends IPersonDropzone {
}

/**
 * Represents the dropzone for importing registered owner data onto the parking violation form's detail page.
 *
 * The state is left out of the mapping even though the section carries one: a dropped person's state arrives as a
 * name with no code, and the section holds it as an option field drawn from the state value list. The owner's
 * state is picked rather than dropped until there is a reason to resolve it, as the vehicle's make is.
 */
export class DetailPageOwnerDropzone extends PersonDropzone implements IDetailPageOwnerDropzone {
    constructor(page: DetailPageModel, schema: OKParkingFormSchema) {
        super(
            page,
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection),
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getFirstName(),
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getMiddleName(),
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getLastName(),
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getAddress(),
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getCity(),
            undefined,
            page.get<RegisteredOwnerSectionModel>(schema.registeredOwnerSection).getZipCode()
        );
    }
}
