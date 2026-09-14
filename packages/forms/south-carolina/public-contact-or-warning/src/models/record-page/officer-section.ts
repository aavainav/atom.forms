import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IOfficerSection extends ISection {
}

export interface IOfficerSectionModel extends IOfficerSection {
}

/** Represents the model for the officer section of the public contact/warning record. */
export class OfficerSectionModel extends SectionModel implements IOfficerSectionModel {
    private formSchema: PublicContactOrWarningFormSchema = this.getSchema<PublicContactOrWarningFormSchema>();

    public readonly issuedBy: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerIssuedBy;
    public readonly rank: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerRank;
    public readonly scCjaNumber: FieldDefinition<StringFieldModel> = this.formSchema.officerFields.officerScCjaNumber;

    public getIssuedBy(): StringFieldModel { return this.get<StringFieldModel>(this.issuedBy); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getScCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.scCjaNumber); }
}
