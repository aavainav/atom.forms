import { IViolationDropzone, ViolationDropzone } from "@forms/core";
import { OKTrafficFormSchema } from "../../traffic-form-schema";
import { ComplaintPageModel } from "../complaint-page";
import { ViolationSectionModel } from "../violation-section";

export interface IComplaintPageViolationDropzone extends IViolationDropzone {
}

/**
 * Represents the dropzone for importing a violation onto the complaint page's violation boxes.
 *
 * The citation prints a municipal code and an offense code side by side; a violation carries one code, which goes
 * into the municipal box, and its statute into the offense box. The citation has no box for the description at
 * all - the charge is identified by its codes and the notes box beneath carries whatever else is written - and the
 * fine belongs to the offense section, so the service writes both of those.
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
