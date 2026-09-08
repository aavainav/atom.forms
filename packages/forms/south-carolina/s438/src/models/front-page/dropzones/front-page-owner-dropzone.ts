import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { FrontPageModel } from "../front-page";
import { OwnerSectionModel } from "../owner-section";

export interface IFrontPageOwnerDropzone extends IPersonDropzone {
}

/** Represents the dropzone for importing owner data onto the s438 form's front page. */
export class FrontPageOwnerDropzone extends PersonDropzone implements IFrontPageOwnerDropzone {
    constructor(page: FrontPageModel, schema: S438FormSchema) {
        super(
            page, 
            page.get<OwnerSectionModel>(schema.ownerSection),
            page.get<OwnerSectionModel>(schema.ownerSection).getFirstName(),
            page.get<OwnerSectionModel>(schema.ownerSection).getMiddleName(),
            page.get<OwnerSectionModel>(schema.ownerSection).getLastName(),
            page.get<OwnerSectionModel>(schema.ownerSection).getStreetAddress(),
            page.get<OwnerSectionModel>(schema.ownerSection).getCity(),
            page.get<OwnerSectionModel>(schema.ownerSection).getState(),
            page.get<OwnerSectionModel>(schema.ownerSection).getZipCode(),
        );
    }
}