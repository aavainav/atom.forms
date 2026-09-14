import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IRoadwaySection extends ISection {
}

export interface IRoadwaySectionModel extends IRoadwaySection {
}

/** Represents the model for the roadway the unit was on, what the vehicle was doing before the impact, the traffic control devices in place, and the vehicle conditions contributing to the collision. */
export class RoadwaySectionModel extends SectionModel implements IRoadwaySectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly grade: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayGrade;
    public readonly alignment: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayAlignment;
    public readonly vehicleActionPriorToImpact: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayVehicleActionPriorToImpact;
    public readonly trafficControlDeviceFirst: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayTrafficControlDeviceFirst;
    public readonly trafficControlDeviceSecond: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayTrafficControlDeviceSecond;
    public readonly trafficControlDeviceThird: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayTrafficControlDeviceThird;
    public readonly trafficControlDeviceFourth: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayTrafficControlDeviceFourth;
    public readonly vehicleContributingCircumstances: FieldDefinition<OptionFieldModel> = this.formSchema.roadwayFields.roadwayVehicleContributingCircumstances;

    public getGrade(): OptionFieldModel { return this.get<OptionFieldModel>(this.grade); }
    public getAlignment(): OptionFieldModel { return this.get<OptionFieldModel>(this.alignment); }
    public getVehicleActionPriorToImpact(): OptionFieldModel { return this.get<OptionFieldModel>(this.vehicleActionPriorToImpact); }
    public getTrafficControlDeviceFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceFirst); }
    public getTrafficControlDeviceSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceSecond); }
    public getTrafficControlDeviceThird(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceThird); }
    public getTrafficControlDeviceFourth(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceFourth); }
    public getVehicleContributingCircumstances(): OptionFieldModel { return this.get<OptionFieldModel>(this.vehicleContributingCircumstances); }
}
