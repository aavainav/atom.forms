import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ITrafficwaySection extends ISection {
}

export interface ITrafficwaySectionModel extends ITrafficwaySection {
}

/** Represents the model for how the trafficway the collision occurred on runs and how it is divided. */
export class TrafficwaySectionModel extends SectionModel implements ITrafficwaySectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly direction: FieldDefinition<OptionFieldModel> = this.schema.trafficwayFields.trafficwayDirection;
    public readonly divided: FieldDefinition<OptionFieldModel> = this.schema.trafficwayFields.trafficwayDivided;

    public getDirection(): OptionFieldModel { return this.get<OptionFieldModel>(this.direction); }
    public getDivided(): OptionFieldModel { return this.get<OptionFieldModel>(this.divided); }
}
