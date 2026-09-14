import { ISection, FieldDefinition, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/**
 * Represents the model for the vehicle section of the traffic citation form's complaint page.
 *
 * This is the one section on the form carrying a dependent pair: the model list hangs off the make, and both sit
 * here, which is what lets a change of make clear the model in the same update.
 */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly year: FieldDefinition<NumberFieldModel> = this.formSchema.vehicleFields.vehicleYear;
    public readonly make: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleMake;
    public readonly model: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleModel;
    public readonly style: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleStyle;
    public readonly color: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleColor;
    public readonly vin: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleVin;
    public readonly tag: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleTag;
    public readonly tagState: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleTagState;
    public readonly registrationExpires: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleRegistrationExpires;
    public readonly commercialVehicle: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleCommercialVehicle;
    public readonly hazardousMaterials: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleHazardousMaterials;

    public getColor(): StringFieldModel { return this.get<StringFieldModel>(this.color); }
    public getCommercialVehicle(): OptionFieldModel { return this.get<OptionFieldModel>(this.commercialVehicle); }
    public getHazardousMaterials(): OptionFieldModel { return this.get<OptionFieldModel>(this.hazardousMaterials); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getModel(): OptionFieldModel { return this.get<OptionFieldModel>(this.model); }
    public getRegistrationExpires(): StringFieldModel { return this.get<StringFieldModel>(this.registrationExpires); }
    public getStyle(): StringFieldModel { return this.get<StringFieldModel>(this.style); }
    public getTag(): StringFieldModel { return this.get<StringFieldModel>(this.tag); }
    public getTagState(): OptionFieldModel { return this.get<OptionFieldModel>(this.tagState); }
    public getVin(): StringFieldModel { return this.get<StringFieldModel>(this.vin); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
}
