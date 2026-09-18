import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { OKParkingFormSchema } from "../../parking-form-schema";
import { DetailPageModel } from "../detail-page";
import { RegisteredOwnerSectionModel } from "../registered-owner-section";

export interface IDetailPageOwnerDropzone extends IPersonDropzone {
}

/**
 * Dropzone for registered owner data onto the detail page. State is left out despite the section carrying one:
 * a dropped person's state arrives as a name with no code, while the section holds an option field from the
 * state value list. It stays picked rather than dropped until there's reason to resolve it, like the vehicle's make.
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
