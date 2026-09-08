import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface ICertificationSection extends ISection {
}

export interface ICertificationSectionModel extends ICertificationSection {
}

/** Represents the model for the clerk's certification that the record is a true and correct copy. */
export class CertificationSectionModel extends SectionModel implements ICertificationSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

    public readonly clerkSignature: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationClerkSignature;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationDate;

    public getClerkSignature(): StringFieldModel { return this.get<StringFieldModel>(this.clerkSignature); }
    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
}
