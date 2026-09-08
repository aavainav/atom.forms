import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { FrontPageModel } from "../front-page";
import { ViolationSectionModel } from "../violation-section";

export interface IFrontPageViolationDropzone extends IViolationDropzone {
}

/**
 * Represents the dropzone for importing a violation onto the s438 form's front page.
 *
 * The S438 prints the statute as its violation section number and carries no fine, so the code and the fine are
 * left out; a dropzone ignores what it holds no field for. The court-appearance answer is a Yes/No pair rather
 * than a single box, so it is applied by the service rather than mapped here.
 */
export class FrontPageViolationDropzone extends ViolationDropzone implements IFrontPageViolationDropzone {
    constructor(page: FrontPageModel, schema: S438FormSchema) {
        const section = page.get<ViolationSectionModel>(schema.violationSection);

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
