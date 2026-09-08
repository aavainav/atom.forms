import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IHarmfulEventSection extends ISection {
}

export interface IHarmfulEventSectionModel extends IHarmfulEventSection {
}

/** Represents the model for the first harmful event of the collision and where on the trafficway it occurred. */
export class HarmfulEventSectionModel extends SectionModel implements IHarmfulEventSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly first: FieldDefinition<OptionFieldModel> = this.schema.harmfulEventFields.harmfulEventFirst;
    public readonly location: FieldDefinition<OptionFieldModel> = this.schema.harmfulEventFields.harmfulEventLocation;

    public getFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.first); }
    public getLocation(): OptionFieldModel { return this.get<OptionFieldModel>(this.location); }
}
