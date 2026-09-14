import { 
    ISection, 
    BooleanFieldModel,
    NumberFieldModel, 
    SectionModel, 
    FieldDefinition, 
    StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/** Represents the model for the vehicle section of the s438 form's front page. */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleLicenseNumber;
    public readonly licenseState: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleLicenseState;
    public readonly make: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleMake;
    public readonly year: FieldDefinition<NumberFieldModel> = this.formSchema.vehicleFields.vehicleYear;
    public readonly auto: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleAuto;
    public readonly bicycle: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleBicycle;
    public readonly combination: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleCombination;
    public readonly commercial: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleCommercialVehicle;
    public readonly hazardousMaterials: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleHazardousMaterials;
    public readonly moped: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleMoped;
    public readonly motorcycle: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleMotorcycle;
    public readonly pedestrian: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehiclePedestrian;
    public readonly other: FieldDefinition<BooleanFieldModel> = this.formSchema.vehicleFields.vehicleOther;

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