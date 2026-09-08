import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { TR310FormSchema } from "../../tr310-form-schema";
import { UnitPageModel } from "../unit-page";
import { OwnerSectionModel } from "../owner-section";

export interface IUnitPageOwnerDropzone extends IPersonDropzone {
}

/**
 * Represents the dropzone for importing person data onto a TR-310 unit page's registered owner.
 *
 * The state is left off for the same reason the person page's dropzone leaves it off: the report holds it as a
 * code from a value list, which a dropped name cannot supply.
 */
export class UnitPageOwnerDropzone extends PersonDropzone implements IUnitPageOwnerDropzone {
    constructor(page: UnitPageModel, schema: TR310FormSchema) {
        const section = page.get<OwnerSectionModel>(schema.ownerSection);

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
