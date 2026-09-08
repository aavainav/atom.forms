import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IDriverLicenseSection extends ISection {
}

export interface IDriverLicenseSectionModel extends IDriverLicenseSection {
}

/** Represents the model for the driver's licence, which only applies when the person the page records is a driver rather than a non-motorist. */
export class DriverLicenseSectionModel extends SectionModel implements IDriverLicenseSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly number: FieldDefinition<StringFieldModel> = this.schema.driverLicenseFields.driverLicenseNumber;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.driverLicenseFields.driverLicenseState;
    public readonly class: FieldDefinition<StringFieldModel> = this.schema.driverLicenseFields.driverLicenseClass;
    public readonly jurisdiction: FieldDefinition<OptionFieldModel> = this.schema.driverLicenseFields.driverLicenseJurisdiction;

    public getNumber(): StringFieldModel { return this.get<StringFieldModel>(this.number); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getClass(): StringFieldModel { return this.get<StringFieldModel>(this.class); }
    public getJurisdiction(): OptionFieldModel { return this.get<OptionFieldModel>(this.jurisdiction); }
}
