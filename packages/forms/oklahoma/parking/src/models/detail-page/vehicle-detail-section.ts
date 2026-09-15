import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IVehicleDetailSection extends ISection {
}

export interface IVehicleDetailSectionModel extends IVehicleDetailSection {
}

/**
 * Represents the model for the vehicle detail section of the parking violation form's detail page.
 *
 * The make lives on the citation page, so this section carries the rest of the vehicle's description. The model
 * is free text rather than an option field for that reason: the vehicle model list hangs off the make, and a
 * dependent select needs both fields on one section to clear the child when the parent changes.
 */
export class VehicleDetailSectionModel extends SectionModel implements IVehicleDetailSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(VehicleDetailSectionModel);

    public readonly vin: FieldDefinition<StringFieldModel> = this.schema.vehicleDetailFields.vehicleVin;
    public readonly registrationExpires: FieldDefinition<StringFieldModel> = this.schema.vehicleDetailFields.vehicleRegistrationExpires;
    public readonly year: FieldDefinition<NumberFieldModel> = this.schema.vehicleDetailFields.vehicleYear;
    public readonly type: FieldDefinition<StringFieldModel> = this.schema.vehicleDetailFields.vehicleType;
    public readonly color: FieldDefinition<StringFieldModel> = this.schema.vehicleDetailFields.vehicleColor;
    public readonly model: FieldDefinition<StringFieldModel> = this.schema.vehicleDetailFields.vehicleModel;
    public readonly noLicensePlate: FieldDefinition<BooleanFieldModel> = this.schema.vehicleDetailFields.vehicleNoLicensePlate;

    public getColor(): StringFieldModel { return this.get<StringFieldModel>(this.color); }
    public getModel(): StringFieldModel { return this.get<StringFieldModel>(this.model); }
    public getNoLicensePlate(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.noLicensePlate); }
    public getRegistrationExpires(): StringFieldModel { return this.get<StringFieldModel>(this.registrationExpires); }
    public getType(): StringFieldModel { return this.get<StringFieldModel>(this.type); }
    public getVin(): StringFieldModel { return this.get<StringFieldModel>(this.vin); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
}
