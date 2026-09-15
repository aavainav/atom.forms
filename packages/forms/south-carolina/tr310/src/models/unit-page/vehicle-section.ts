import { FieldDefinition, FormModel, ISection, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/** Represents the model for the vehicle the unit page records, from its plate and VIN through to how badly it was damaged. */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(VehicleSectionModel);

    public readonly status: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleStatus;
    public readonly plateNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehiclePlateNumber;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleState;
    public readonly plateExpires: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehiclePlateExpires;
    public readonly identificationNumber: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleIdentificationNumber;
    public readonly damageExtent: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleDamageExtent;
    public readonly hitAndRun: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleHitAndRun;
    public readonly year: FieldDefinition<NumberFieldModel> = this.schema.vehicleFields.vehicleYear;
    public readonly make: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleMake;
    public readonly model: FieldDefinition<OptionFieldModel> = this.schema.vehicleFields.vehicleModel;
    public readonly bodyType: FieldDefinition<StringFieldModel> = this.schema.vehicleFields.vehicleBodyType;
    public readonly occupantCount: FieldDefinition<NumberFieldModel> = this.schema.vehicleFields.vehicleOccupantCount;

    public getStatus(): OptionFieldModel { return this.get<OptionFieldModel>(this.status); }
    public getPlateNumber(): StringFieldModel { return this.get<StringFieldModel>(this.plateNumber); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getPlateExpires(): StringFieldModel { return this.get<StringFieldModel>(this.plateExpires); }
    public getIdentificationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.identificationNumber); }
    public getDamageExtent(): OptionFieldModel { return this.get<OptionFieldModel>(this.damageExtent); }
    public getHitAndRun(): OptionFieldModel { return this.get<OptionFieldModel>(this.hitAndRun); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getModel(): OptionFieldModel { return this.get<OptionFieldModel>(this.model); }
    public getBodyType(): StringFieldModel { return this.get<StringFieldModel>(this.bodyType); }
    public getOccupantCount(): NumberFieldModel { return this.get<NumberFieldModel>(this.occupantCount); }
}
