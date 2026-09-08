import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { FrontPageModel } from "../front-page";
import { ViolatorSectionModel } from "../violator-section";

export interface IFrontPageViolatorDropzone extends IPersonDropzone {
}

/** Represents the dropzone for importing violator data onto the s438 form's front page. */
export class FrontPageViolatorDropzone extends PersonDropzone implements IFrontPageViolatorDropzone {
    constructor(page: FrontPageModel, schema: S438FormSchema) {
        super(
            page, 
            page.get<ViolatorSectionModel>(schema.violatorSection),
            page.get<ViolatorSectionModel>(schema.violatorSection).getFirstName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getMiddleName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getLastName(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getStreetAddress(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getCity(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getState(),
            page.get<ViolatorSectionModel>(schema.violatorSection).getZipCode(),
        );
    }
}