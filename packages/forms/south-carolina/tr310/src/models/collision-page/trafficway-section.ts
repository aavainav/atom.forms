import { ISection, FieldDefinition, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ITrafficwaySection extends ISection {
}

export interface ITrafficwaySectionModel extends ITrafficwaySection {
}

/** Represents the model for how the trafficway the collision occurred on runs and how it is divided. */
export class TrafficwaySectionModel extends SectionModel implements ITrafficwaySectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly direction: FieldDefinition<OptionFieldModel> = this.formSchema.trafficwayFields.trafficwayDirection;
    public readonly divided: FieldDefinition<OptionFieldModel> = this.formSchema.trafficwayFields.trafficwayDivided;

    public getDirection(): OptionFieldModel { return this.get<OptionFieldModel>(this.direction); }
    public getDivided(): OptionFieldModel { return this.get<OptionFieldModel>(this.divided); }
}
