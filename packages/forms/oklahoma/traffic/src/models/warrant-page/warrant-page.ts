import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";
import { CertificationSectionModel } from "./certification-section";
import { ComplaintSectionModel } from "./complaint-section";
import { WarrantSectionModel } from "./warrant-section";

export interface IWarrantPage {
}

export interface IWarrantPageModel extends IWarrantPage {
}

/**
 * Represents the warrant page of the traffic citation form.
 *
 * The page carries no officer data of its own; it is what the municipal counselor and the court clerk endorse
 * once the complaint on page one has been filed.
 */
export class WarrantPageModel extends PageModel implements IWarrantPageModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(WarrantPageModel);

    public readonly complaintSection: SectionDefinition<ComplaintSectionModel> = this.schema.complaintSection;
    public readonly certificationSection: SectionDefinition<CertificationSectionModel> = this.schema.certificationSection;
    public readonly warrantSection: SectionDefinition<WarrantSectionModel> = this.schema.warrantSection;

    public getCertificationSection(): CertificationSectionModel { return this.get<CertificationSectionModel>(this.certificationSection); }
    public getComplaintSection(): ComplaintSectionModel { return this.get<ComplaintSectionModel>(this.complaintSection); }
    public getWarrantSection(): WarrantSectionModel { return this.get<WarrantSectionModel>(this.warrantSection); }
}
