import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { GAUTCFormSchema } from "../../utc-form-schema";
import { CitationPageModel } from "../citation-page";
import { OffenseSectionModel } from "../offense-section";

export interface ICitationPageViolationDropzone extends IViolationDropzone {
}

/**
 * Dropzone for a violation onto the citation page's offense boxes. The charge lands on the **offense** section,
 * not the section this form calls "violation" (which holds speed detection equipment instead). No fine or points
 * here, and state law/local ordinance is an exclusive pair rather than a single box, so both are left to the service.
 */
export class CitationPageViolationDropzone extends ViolationDropzone implements ICitationPageViolationDropzone {
    constructor(page: CitationPageModel, schema: GAUTCFormSchema) {
        const section = page.get<OffenseSectionModel>(schema.offenseSection);

        super(
            page,
            section,
            undefined,
            section.getDescription(),
            section.getCodeSection(),
        );
    }
}
