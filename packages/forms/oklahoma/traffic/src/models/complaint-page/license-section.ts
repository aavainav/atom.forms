import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
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
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(LicenseSectionModel);

    public readonly identifier: FieldDefinition<StringFieldModel> = this.schema.licenseFields.licenseIdentifier;
    public readonly licenseClass: FieldDefinition<StringFieldModel> = this.schema.licenseFields.licenseClass;
    public readonly endorsements: FieldDefinition<StringFieldModel> = this.schema.licenseFields.licenseEndorsements;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.licenseFields.licenseState;
    public readonly expires: FieldDefinition<StringFieldModel> = this.schema.licenseFields.licenseExpires;

    public getEndorsements(): StringFieldModel { return this.get<StringFieldModel>(this.endorsements); }
    public getExpires(): StringFieldModel { return this.get<StringFieldModel>(this.expires); }
    public getIdentifier(): StringFieldModel { return this.get<StringFieldModel>(this.identifier); }
    public getLicenseClass(): StringFieldModel { return this.get<StringFieldModel>(this.licenseClass); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
}
