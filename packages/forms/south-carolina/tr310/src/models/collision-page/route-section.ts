import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IRouteSection extends ISection {
}

export interface IRouteSectionModel extends IRouteSection {
}

/** Represents the model for the route the collision occurred on, together with the lane and the offset from the base intersection. */
export class RouteSectionModel extends SectionModel implements IRouteSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly category: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeCategory;
    public readonly auxiliary: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeAuxiliary;
    public readonly number: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeNumber;
    public readonly routeName: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeName;
    public readonly railroadId: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeRailroadId;
    public readonly laneNumber: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeLaneNumber;
    public readonly laneCount: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeLaneCount;
    public readonly distanceOffsetMiles: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeDistanceOffsetMiles;
    public readonly distanceOffsetFeet: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeDistanceOffsetFeet;
    public readonly direction: FieldDefinition<StringFieldModel> = this.formSchema.routeFields.routeDirection;

    public getCategory(): StringFieldModel { return this.get<StringFieldModel>(this.category); }
    public getAuxiliary(): StringFieldModel { return this.get<StringFieldModel>(this.auxiliary); }
    public getNumber(): StringFieldModel { return this.get<StringFieldModel>(this.number); }
    public getRouteName(): StringFieldModel { return this.get<StringFieldModel>(this.routeName); }
    public getRailroadId(): StringFieldModel { return this.get<StringFieldModel>(this.railroadId); }
    public getLaneNumber(): StringFieldModel { return this.get<StringFieldModel>(this.laneNumber); }
    public getLaneCount(): StringFieldModel { return this.get<StringFieldModel>(this.laneCount); }
    public getDistanceOffsetMiles(): StringFieldModel { return this.get<StringFieldModel>(this.distanceOffsetMiles); }
    public getDistanceOffsetFeet(): StringFieldModel { return this.get<StringFieldModel>(this.distanceOffsetFeet); }
    public getDirection(): StringFieldModel { return this.get<StringFieldModel>(this.direction); }
}
