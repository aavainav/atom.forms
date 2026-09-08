import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IRoadwaySection extends ISection {
}

export interface IRoadwaySectionModel extends IRoadwaySection {
}

/** Represents the model for the roadway the unit was on, what the vehicle was doing before the impact, the traffic control devices in place, and the vehicle conditions contributing to the collision. */
export class RoadwaySectionModel extends SectionModel implements IRoadwaySectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly grade: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayGrade;
    public readonly alignment: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayAlignment;
    public readonly vehicleActionPriorToImpact: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayVehicleActionPriorToImpact;
    public readonly trafficControlDeviceFirst: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayTrafficControlDeviceFirst;
    public readonly trafficControlDeviceSecond: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayTrafficControlDeviceSecond;
    public readonly trafficControlDeviceThird: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayTrafficControlDeviceThird;
    public readonly trafficControlDeviceFourth: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayTrafficControlDeviceFourth;
    public readonly vehicleContributingCircumstances: FieldDefinition<OptionFieldModel> = this.schema.roadwayFields.roadwayVehicleContributingCircumstances;

    public getGrade(): OptionFieldModel { return this.get<OptionFieldModel>(this.grade); }
    public getAlignment(): OptionFieldModel { return this.get<OptionFieldModel>(this.alignment); }
    public getVehicleActionPriorToImpact(): OptionFieldModel { return this.get<OptionFieldModel>(this.vehicleActionPriorToImpact); }
    public getTrafficControlDeviceFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceFirst); }
    public getTrafficControlDeviceSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceSecond); }
    public getTrafficControlDeviceThird(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceThird); }
    public getTrafficControlDeviceFourth(): OptionFieldModel { return this.get<OptionFieldModel>(this.trafficControlDeviceFourth); }
    public getVehicleContributingCircumstances(): OptionFieldModel { return this.get<OptionFieldModel>(this.vehicleContributingCircumstances); }
}
