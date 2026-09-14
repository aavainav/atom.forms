import { ISection, FieldDefinition, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ITravelSection extends ISection {
}

export interface ITravelSectionModel extends ITravelSection {
}

/** Represents the model for which way the unit was travelling and how speed was involved. */
export class TravelSectionModel extends SectionModel implements ITravelSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly direction: FieldDefinition<OptionFieldModel> = this.formSchema.travelFields.travelDirection;
    public readonly speedRelated: FieldDefinition<OptionFieldModel> = this.formSchema.travelFields.travelSpeedRelated;
    public readonly estimatedSpeed: FieldDefinition<StringFieldModel> = this.formSchema.travelFields.travelEstimatedSpeed;
    public readonly speedLimit: FieldDefinition<StringFieldModel> = this.formSchema.travelFields.travelSpeedLimit;

    public getDirection(): OptionFieldModel { return this.get<OptionFieldModel>(this.direction); }
    public getSpeedRelated(): OptionFieldModel { return this.get<OptionFieldModel>(this.speedRelated); }
    public getEstimatedSpeed(): StringFieldModel { return this.get<StringFieldModel>(this.estimatedSpeed); }
    public getSpeedLimit(): StringFieldModel { return this.get<StringFieldModel>(this.speedLimit); }
}
