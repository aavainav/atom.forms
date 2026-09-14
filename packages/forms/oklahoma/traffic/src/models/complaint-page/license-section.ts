import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface ILicenseSection extends ISection {
}

export interface ILicenseSectionModel extends ILicenseSection {
}

/**
 * Represents the model for the driver license section of the traffic citation form's complaint page.
 *
 * The license number is `identifier` rather than `id`, because `Entity` already declares an `id` holding the
 * section's own identity and a field definition cannot shadow it.
 */
export class LicenseSectionModel extends SectionModel implements ILicenseSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly identifier: FieldDefinition<StringFieldModel> = this.formSchema.licenseFields.licenseIdentifier;
    public readonly licenseClass: FieldDefinition<StringFieldModel> = this.formSchema.licenseFields.licenseClass;
    public readonly endorsements: FieldDefinition<StringFieldModel> = this.formSchema.licenseFields.licenseEndorsements;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.licenseFields.licenseState;
    public readonly expires: FieldDefinition<StringFieldModel> = this.formSchema.licenseFields.licenseExpires;

    public getEndorsements(): StringFieldModel { return this.get<StringFieldModel>(this.endorsements); }
    public getExpires(): StringFieldModel { return this.get<StringFieldModel>(this.expires); }
    public getIdentifier(): StringFieldModel { return this.get<StringFieldModel>(this.identifier); }
    public getLicenseClass(): StringFieldModel { return this.get<StringFieldModel>(this.licenseClass); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
}
