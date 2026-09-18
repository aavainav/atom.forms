import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface ICertificationSection extends ISection {
}

export interface ICertificationSectionModel extends ICertificationSection {
}

/** Model for Section V (Arresting Officer's Certification). The sworn date is the day/month/year boxes the paper prints; the year box follows a printed "20" and so carries only its last two digits. */
export class CertificationSectionModel extends SectionModel implements ICertificationSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(CertificationSectionModel);

    public readonly officerSignature: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationOfficerSignature;
    public readonly swornDay: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationSwornDay;
    public readonly swornMonth: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationSwornMonth;
    public readonly swornYear: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationSwornYear;
    public readonly signatureAndTitle: FieldDefinition<StringFieldModel> = this.schema.certificationFields.certificationSignatureAndTitle;

    public getOfficerSignature(): StringFieldModel { return this.get<StringFieldModel>(this.officerSignature); }
    public getSignatureAndTitle(): StringFieldModel { return this.get<StringFieldModel>(this.signatureAndTitle); }
    public getSwornDay(): StringFieldModel { return this.get<StringFieldModel>(this.swornDay); }
    public getSwornMonth(): StringFieldModel { return this.get<StringFieldModel>(this.swornMonth); }
    public getSwornYear(): StringFieldModel { return this.get<StringFieldModel>(this.swornYear); }
}
