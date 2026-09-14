import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
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
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.formSchema.complaintFields.complaintCitationNumber;
    public readonly counselor: FieldDefinition<StringFieldModel> = this.formSchema.complaintFields.complaintCounselor;
    public readonly date: FieldDefinition<StringFieldModel> = this.formSchema.complaintFields.complaintDate;

    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
    public getCounselor(): StringFieldModel { return this.get<StringFieldModel>(this.counselor); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
}
