import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";
import { CertificationSectionModel } from "./certification-section";
import { ComplaintSectionModel } from "./complaint-section";
import { WarrantSectionModel } from "./warrant-section";

export interface IComplaintPage {
}

export interface IComplaintPageModel extends IComplaintPage {
}

/** The complaint page. Carries no officer data of its own -- it's what the municipal counselor and court clerk endorse once the citation on page one has been filed. */
export class ComplaintPageModel extends PageModel implements IComplaintPageModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(ComplaintPageModel);

    public readonly complaintSection: SectionDefinition<ComplaintSectionModel> = this.schema.complaintSection;
    public readonly certificationSection: SectionDefinition<CertificationSectionModel> = this.schema.certificationSection;
    public readonly warrantSection: SectionDefinition<WarrantSectionModel> = this.schema.warrantSection;

    public getCertificationSection(): CertificationSectionModel { return this.get<CertificationSectionModel>(this.certificationSection); }
    public getComplaintSection(): ComplaintSectionModel { return this.get<ComplaintSectionModel>(this.complaintSection); }
    public getWarrantSection(): WarrantSectionModel { return this.get<WarrantSectionModel>(this.warrantSection); }
}
