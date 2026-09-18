import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { ViolationSectionModel } from "../violation-section";

export interface IComplaintPageViolationDropzone extends IViolationDropzone {
}

/**
 * Dropzone for a violation onto the complaint page's violation boxes. The citation prints municipal and offense
 * codes side by side; a violation's code goes into the municipal box, its statute into the offense box. There's
 * no description box -- the charge is identified by codes, with notes beneath -- and the fine belongs to the
 * offense section, so the service writes both.
 */
export class ComplaintPageViolationDropzone extends ViolationDropzone implements IComplaintPageViolationDropzone {
    constructor(page: ComplaintPageModel, schema: OKTrafficFormSchema) {
        const section = page.get<ViolationSectionModel>(schema.violationSection);

        super(
            page,
            section,
            section.getMunicipalCode(),
            undefined,
            section.getOffenseCode(),
        );
    }
}
