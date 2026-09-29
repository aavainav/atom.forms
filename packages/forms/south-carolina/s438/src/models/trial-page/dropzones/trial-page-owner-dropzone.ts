import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { TrialOwnerSectionModel } from "../owner-section";
import { TrialPageModel } from "../trial-page";

export interface ITrialPageOwnerDropzone extends IPersonDropzone {
}

/** Represents the dropzone for importing owner data onto the s438 form's trial page. */
export class TrialPageOwnerDropzone extends PersonDropzone implements ITrialPageOwnerDropzone {
    constructor(page: TrialPageModel, schema: S438FormSchema) {
        const section = page.get<TrialOwnerSectionModel>(schema.trialOwnerSection);

        super(
            page,
            section,
            section.getFirstName(),
            section.getMiddleName(),
            section.getLastName(),
            section.getStreetAddress(),
            section.getCity(),
            section.getState(),
            section.getZipCode(),
        );
    }
}
