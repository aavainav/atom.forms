import { BooleanFieldModel, FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";

export interface ITrialVehicleSection extends ISection {
}

export interface ITrialVehicleSectionModel extends ITrialVehicleSection {
}

/** Represents the model for the vehicle section of the s438 form's trial page. */
export class TrialVehicleSectionModel extends SectionModel implements ITrialVehicleSectionModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialVehicleSectionModel);

    public readonly licenseNumber: FieldDefinition<StringFieldModel> = this.schema.trialVehicleFields.trialVehicleLicenseNumber;
    public readonly licenseState: FieldDefinition<StringFieldModel> = this.schema.trialVehicleFields.trialVehicleLicenseState;
    public readonly make: FieldDefinition<StringFieldModel> = this.schema.trialVehicleFields.trialVehicleMake;
    public readonly year: FieldDefinition<NumberFieldModel> = this.schema.trialVehicleFields.trialVehicleYear;
    public readonly auto: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleAuto;
    public readonly bicycle: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleBicycle;
    public readonly combination: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleCombination;
    public readonly commercial: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleCommercialVehicle;
    public readonly hazardousMaterials: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleHazardousMaterials;
    public readonly moped: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleMoped;
    public readonly motorcycle: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleMotorcycle;
    public readonly pedestrian: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehiclePedestrian;
    public readonly other: FieldDefinition<BooleanFieldModel> = this.schema.trialVehicleFields.trialVehicleOther;

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
