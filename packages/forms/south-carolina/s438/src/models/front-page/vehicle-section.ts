import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/** Represents the model for the vehicle section of the s438 form's front page. */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(VehicleSectionModel);

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleLicenseNumber;
    public readonly licenseState: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleLicenseState;
    public readonly make: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleMake;
    public readonly year: FieldDefinition<NumberFieldModel> = this.schema.vehicleFields.vehicleYear;
    public readonly auto: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleAuto;
    public readonly bicycle: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleBicycle;
    public readonly combination: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleCombination;
    public readonly commercial: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleCommercialVehicle;
    public readonly hazardousMaterials: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleHazardousMaterials;
    public readonly moped: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleMoped;
    public readonly motorcycle: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleMotorcycle;
    public readonly pedestrian: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehiclePedestrian;
    public readonly other: FieldDefinition<BooleanFieldModel> = this.schema.vehicleFields.vehicleOther;

    public getLicenseNumber(): StringFieldModel { return this.get<StringFieldModel>(this.licenseNumber); }
    public getLicenseState(): StringFieldModel { return this.get<StringFieldModel>(this.licenseState); }
    public getMake(): StringFieldModel { return this.get<StringFieldModel>(this.make); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
    public getAuto(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.auto); }
    public getBicycle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.bicycle); }
    public getCombination(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.combination); }
    public getCommercial(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.commercial); }
    public getHazardousMaterials(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.hazardousMaterials); }
    public getMoped(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.moped); }
    public getMotorcycle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.motorcycle); }
    public getPedestrian(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.pedestrian); }
    public getOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.other); }
} 