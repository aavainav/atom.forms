import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IComplaintSection extends ISection {
}

export interface IComplaintSectionModel extends IComplaintSection {
}

/** Model for the complaint section of the complaint page. The complaint's text is preprinted and incorporates page one by reference, so only the citation it belongs to and the filing counselor are filled in here. */
export class ComplaintSectionModel extends SectionModel implements IComplaintSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(ComplaintSectionModel);

    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintCitationNumber;
    public readonly counselor: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintCounselor;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintDate;

    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
    public getCounselor(): StringFieldModel { return this.get<StringFieldModel>(this.counselor); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
}
