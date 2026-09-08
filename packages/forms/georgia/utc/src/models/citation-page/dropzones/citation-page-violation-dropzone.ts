import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { GAUTCFormSchema } from "../../utc-form-schema";
import { CitationPageModel } from "../citation-page";
import { OffenseSectionModel } from "../offense-section";

export interface ICitationPageViolationDropzone extends IViolationDropzone {
}

/**
 * Represents the dropzone for importing a violation onto the citation page's offense boxes.
 *
 * The charge lands on the **offense** section rather than the section this form calls "violation", which holds the
 * speed detection equipment instead. The citation carries no fine and no points, and its state law / local
 * ordinance answer is an exclusive pair rather than a single box, so those are left to the service.
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
