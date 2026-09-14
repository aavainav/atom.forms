import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDriverLicenseSection extends ISection {
}

export interface IDriverLicenseSectionModel extends IDriverLicenseSection {
}

/** Represents the model for the driver's licence, which only applies when the person the page records is a driver rather than a non-motorist. */
export class DriverLicenseSectionModel extends SectionModel implements IDriverLicenseSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly number: FieldDefinition<StringFieldModel> = this.formSchema.driverLicenseFields.driverLicenseNumber;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.driverLicenseFields.driverLicenseState;
    public readonly class: FieldDefinition<StringFieldModel> = this.formSchema.driverLicenseFields.driverLicenseClass;
    public readonly jurisdiction: FieldDefinition<OptionFieldModel> = this.formSchema.driverLicenseFields.driverLicenseJurisdiction;

    public getNumber(): StringFieldModel { return this.get<StringFieldModel>(this.number); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getClass(): StringFieldModel { return this.get<StringFieldModel>(this.class); }
    public getJurisdiction(): OptionFieldModel { return this.get<OptionFieldModel>(this.jurisdiction); }
}
