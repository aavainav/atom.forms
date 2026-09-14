import { ISection, FieldDefinition, NumberFieldModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";

export interface IVehicleSection extends ISection {
}

export interface IVehicleSectionModel extends IVehicleSection {
}

/**
 * Represents the model for the vehicle boxes of Section I of the Georgia uniform traffic citation.
 *
 * The make and model are option fields drawn from the national code sets, so a dropped vehicle has to be resolved
 * from the names it arrives with to the codes stored here - see `IGAUTCService.resolveVehicleDropzone`.
 */
export class VehicleSectionModel extends SectionModel implements IVehicleSectionModel {
    private formSchema: GAUTCFormSchema = this.getSchema<GAUTCFormSchema>();

    public readonly year: FieldDefinition<NumberFieldModel> = this.formSchema.vehicleFields.vehicleYear;
    public readonly make: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleMake;
    public readonly model: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleModel;
    public readonly color: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleColor;
    public readonly registrationNumber: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleRegistrationNumber;
    public readonly registrationYear: FieldDefinition<StringFieldModel> = this.formSchema.vehicleFields.vehicleRegistrationYear;
    public readonly registrationState: FieldDefinition<OptionFieldModel> = this.formSchema.vehicleFields.vehicleRegistrationState;

    public getColor(): StringFieldModel { return this.get<StringFieldModel>(this.color); }
    public getMake(): OptionFieldModel { return this.get<OptionFieldModel>(this.make); }
    public getModel(): OptionFieldModel { return this.get<OptionFieldModel>(this.model); }
    public getRegistrationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.registrationNumber); }
    public getRegistrationState(): OptionFieldModel { return this.get<OptionFieldModel>(this.registrationState); }
    public getRegistrationYear(): StringFieldModel { return this.get<StringFieldModel>(this.registrationYear); }
    public getYear(): NumberFieldModel { return this.get<NumberFieldModel>(this.year); }
}
