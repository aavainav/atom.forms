import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { TrialPageModel } from "../trial-page";
import { TrialViolationSectionModel } from "../violation-section";

export interface ITrialPageViolationDropzone extends IViolationDropzone {
}

/** Dropzone for a violation onto the S438's trial page. Like the front page's, it takes the statute as the violation section number and leaves out the code and fine, which the ticket does not print. */
export class TrialPageViolationDropzone extends ViolationDropzone implements ITrialPageViolationDropzone {
    constructor(page: TrialPageModel, schema: S438FormSchema) {
        const section = page.get<TrialViolationSectionModel>(schema.trialViolationSection);

        super(
            page,
            section,
            undefined,
            section.getDescription(),
            section.getSectionNumber(),
            undefined,
            section.getScPoints(),
        );
    }
}
