import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IVehicleDetailSection extends ISection {
}

export interface IVehicleDetailSectionModel extends IVehicleDetailSection {
}

/** Model for the vehicle detail section of the detail page. Make lives on the citation page, so this carries the rest of the description; model is free text since the model list hangs off make, and a dependent select needs both fields on one section. */
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
