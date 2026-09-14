import { ISection, BooleanFieldModel, FieldDefinition, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
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
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly vin: FieldDefinition<StringFieldModel> = this.formSchema.vehicleDetailFields.vehicleVin;
    public readonly registrationExpires: FieldDefinition<StringFieldModel> = this.formSchema.vehicleDetailFields.vehicleRegistrationExpires;
    public readonly year: FieldDefinition<NumberFieldModel> = this.formSchema.vehicleDetailFields.vehicleYear;
    public readonly type: FieldDefinition<StringFieldModel> = this.formSchema.vehicleDetailFields.vehicleType;
    public readonly color: FieldDefinition<StringFieldModel> = this.formSchema.vehicleDetailFields.vehicleColor;
    public readonly model: FieldDefinition<StringFieldModel> = this.formSchema.vehicleDetailFields.vehicleModel;
    public readonly noLicensePlate: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleDetailFields.vehicleNoLicensePlate;

    public getColor(): StringFieldModel { return this.get<StringFieldModel>(this.color); }
    public getModel(): StringFieldModel { return this.get<StringFieldModel>(this.model); }
    public getNoLicensePlate(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.noLicensePlate); }
    public getRegistrationExpires(): StringFieldModel { return this.get<StringFieldModel>(this.registrationExpires); }
    public getType(): StringFieldModel { return this.get<StringFieldModel>(this.type); }
    public getVin(): StringFieldModel { return this.get<StringFieldModel>(this.vin); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
}
