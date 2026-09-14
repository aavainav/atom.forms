import { ISection, BooleanFieldModel, FieldDefinition, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/** Represents the model for the vehicle section of the public contact/warning record. */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private formSchema: PublicContactOrWarningFormSchema = this.getSchema<PublicContactOrWarningFormSchema>();

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleLicenseNumber;
    public readonly state: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleState;
    public readonly make: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleMake;
    public readonly model: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleModel;
    public readonly year: FieldDefinition<NumberFieldModel> = this.formSchema.vehicleFields.vehicleYear;
    public readonly cmv: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleCmv;

    public getLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.licenseNumber); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getModel(): OptionFieldModel { return this.get<OptionFieldModel>(this.model); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
    public getCmv(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.cmv); }
}
