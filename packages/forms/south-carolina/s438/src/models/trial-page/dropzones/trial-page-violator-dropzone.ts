import { IPersonDropzone, PersonDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { TrialPageModel } from "../trial-page";
import { TrialViolatorSectionModel } from "../violator-section";

export interface ITrialPageViolatorDropzone extends IPersonDropzone {
}

/** Represents the dropzone for importing violator data onto the s438 form's trial page. */
export class TrialPageViolatorDropzone extends PersonDropzone implements ITrialPageViolatorDropzone {
    constructor(page: TrialPageModel, schema: S438FormSchema) {
        const section = page.get<TrialViolatorSectionModel>(schema.trialViolatorSection);

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
