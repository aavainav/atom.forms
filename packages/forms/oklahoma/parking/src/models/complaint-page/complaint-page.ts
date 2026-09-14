import { PageModel, SectionDefinition } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";
import { CertificationSectionModel } from "./certification-section";
import { ComplaintSectionModel } from "./complaint-section";
import { WarrantSectionModel } from "./warrant-section";

export interface IComplaintPage {
}

export interface IComplaintPageModel extends IComplaintPage {
}

/**
 * Represents the complaint page of the parking violation form.
 *
 * The page carries no officer data of its own; it is what the municipal counselor and the court clerk endorse
 * once the citation on page one has been filed.
 */
export class ComplaintPageModel extends PageModel implements IComplaintPageModel {
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly complaintSection: SectionDefinition<ComplaintSectionModel> = this.formSchema.complaintSection;
    public readonly certificationSection: SectionDefinition<CertificationSectionModel> = this.formSchema.certificationSection;
    public readonly warrantSection: SectionDefinition<WarrantSectionModel> = this.formSchema.warrantSection;

    public getCertificationSection(): CertificationSectionModel { return this.get<CertificationSectionModel>(this.certificationSection); }
    public getComplaintSection(): ComplaintSectionModel { return this.get<ComplaintSectionModel>(this.complaintSection); }
    public getWarrantSection(): WarrantSectionModel { return this.get<WarrantSectionModel>(this.warrantSection); }
}
