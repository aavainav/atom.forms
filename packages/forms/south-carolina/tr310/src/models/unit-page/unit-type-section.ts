import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IUnitTypeSection extends ISection {
}

export interface IUnitTypeSectionModel extends IUnitTypeSection {
}

/** Represents the model for what kind of unit this was, how it was being used as an emergency vehicle, and what special function it served. */
export class UnitTypeSectionModel extends SectionModel implements IUnitTypeSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly unit: FieldDefinition<OptionFieldModel> = this.formSchema.unitTypeFields.unitTypeUnit;
    public readonly emergencyVehicleUse: FieldDefinition<OptionFieldModel> = this.formSchema.unitTypeFields.unitTypeEmergencyVehicleUse;
    public readonly specialFunction: FieldDefinition<OptionFieldModel> = this.formSchema.unitTypeFields.unitTypeSpecialFunction;

    public getUnit(): OptionFieldModel { return this.get<OptionFieldModel>(this.unit); }
    public getEmergencyVehicleUse(): OptionFieldModel { return this.get<OptionFieldModel>(this.emergencyVehicleUse); }
    public getSpecialFunction(): OptionFieldModel { return this.get<OptionFieldModel>(this.specialFunction); }
}
