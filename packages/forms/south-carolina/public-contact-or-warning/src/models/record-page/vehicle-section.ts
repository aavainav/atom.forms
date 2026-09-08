import { ISection, BooleanFieldModel, FieldDefinition, FormModel, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/** Represents the model for the vehicle section of the public contact/warning record. */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormSchema);

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleLicenseNumber;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleState;
    public readonly make: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleMake;
    public readonly model: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleModel;
    public readonly year: FieldDefinition<NumberFieldModel> = this.schema.vehicleFields.vehicleYear;
    public readonly cmv: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleCmv;

    public getLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.licenseNumber); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getModel(): OptionFieldModel { return this.get<OptionFieldModel>(this.model); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
    public getCmv(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.cmv); }
}
