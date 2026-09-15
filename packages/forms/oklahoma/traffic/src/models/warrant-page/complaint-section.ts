import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IComplaintSection extends ISection {
}

export interface IComplaintSectionModel extends IComplaintSection {
}

/**
 * Represents the model for the complaint section of the traffic citation form's warrant page.
 *
 * The complaint's text is preprinted and incorporates page one by reference, so what is filled in here is only
 * the citation it belongs to and the counselor who found probable cause for filing it.
 */
export class ComplaintSectionModel extends SectionModel implements IComplaintSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(ComplaintSectionModel);

    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintCitationNumber;
    public readonly counselor: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintCounselor;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.complaintFields.complaintDate;

    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
    public getCounselor(): StringFieldModel { return this.get<StringFieldModel>(this.counselor); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
}
