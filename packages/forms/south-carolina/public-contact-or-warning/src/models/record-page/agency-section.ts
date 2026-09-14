import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IAgencySection extends ISection {
}

export interface IAgencySectionModel extends IAgencySection {
}

/** Represents the model for the agency section of the public contact/warning record. */
export class AgencySectionModel extends SectionModel implements IAgencySectionModel {
    private formSchema: PublicContactOrWarningFormSchema = this.getSchema<PublicContactOrWarningFormSchema>();

    public readonly agencyName: FieldDefinition<StringFieldModel> = this.formSchema.agencyFields.agencyName;
    public readonly city: FieldDefinition<StringFieldModel> = this.formSchema.agencyFields.agencyCity;
    public readonly county: FieldDefinition<OptionFieldModel> = this.formSchema.agencyFields.agencyCounty;

    public getAgencyName(): StringFieldModel { return this.get<StringFieldModel>(this.agencyName); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
}
