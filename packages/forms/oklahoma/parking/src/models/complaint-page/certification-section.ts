import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface ICertificationSection extends ISection {
}

export interface ICertificationSectionModel extends ICertificationSection {
}

/** Represents the model for the clerk's certification that the record is a true and correct copy. */
export class CertificationSectionModel extends SectionModel implements ICertificationSectionModel {
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly clerkSignature: FieldDefinition<StringFieldModel> = this.formSchema.certificationFields.certificationClerkSignature;
    public readonly date: FieldDefinition<StringFieldModel> = this.formSchema.certificationFields.certificationDate;

    public getClerkSignature(): StringFieldModel { return this.get<StringFieldModel>(this.clerkSignature); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
}
