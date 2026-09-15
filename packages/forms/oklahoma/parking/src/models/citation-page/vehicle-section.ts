import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/**
 * Represents the model for the vehicle section of the parking citation page.
 *
 * The printed form splits the vehicle across two pages: the plate, make and meter here, and the rest of its
 * description on the detail page. This is the section a dropped vehicle lands on, since the make is the only part
 * of it the citation page carries.
 */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(VehicleSectionModel);

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleLicenseNumber;
    public readonly make: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleMake;
    public readonly meterNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleMeterNumber;

    public getLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.licenseNumber); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getMeterNumber(): StringFieldModel { return this.get<StringFieldModel>(this.meterNumber); }
}
