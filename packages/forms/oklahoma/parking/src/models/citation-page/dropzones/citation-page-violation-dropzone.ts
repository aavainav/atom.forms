import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { OKParkingFormSchema } from "../../parking-form-schema";
import { CitationPageModel } from "../citation-page";
import { ViolationSectionModel } from "../violation-section";

export interface ICitationPageViolationDropzone extends IViolationDropzone {
}

/** Dropzone for a violation onto the citation page's violation boxes. The citation prints its own municipal code beside the description, so code maps but statute doesn't. The fine belongs to the payment section, left to the service, which writes both sections together. */
export class CitationPageViolationDropzone extends ViolationDropzone implements ICitationPageViolationDropzone {
    constructor(page: CitationPageModel, schema: OKParkingFormSchema) {
        const section = page.get<ViolationSectionModel>(schema.violationSection);

        super(
            page,
            section,
            section.getCode(),
            section.getDescription(),
        );
    }
}
