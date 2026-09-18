import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { S438FormSchema } from "../../s438-form-schema";
import { FrontPageModel } from "../front-page";
import { ViolationSectionModel } from "../violation-section";

export interface IFrontPageViolationDropzone extends IViolationDropzone {
}

/**
 * Dropzone for a violation onto the S438's front page. The S438 prints the statute as its violation section
 * number and carries no fine, so both are left out -- a dropzone ignores what it holds no field for. The
 * court-appearance answer is a Yes/No pair, not a single box, so the service applies it rather than this dropzone.
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
