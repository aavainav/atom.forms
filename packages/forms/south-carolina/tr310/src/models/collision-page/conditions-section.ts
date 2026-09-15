import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IConditionsSection extends ISection {
}

export interface IConditionsSectionModel extends IConditionsSection {
}

/** Represents the model for the conditions at the time of the collision - light, weather, road surface - and the manner in which the units came together. */
export class ConditionsSectionModel extends SectionModel implements IConditionsSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(ConditionsSectionModel);

    public readonly light: FieldDefinition<OptionFieldModel> = this.schema.conditionsFields.conditionsLight;
    public readonly weatherFirst: FieldDefinition<OptionFieldModel> = this.schema.conditionsFields.conditionsWeatherFirst;
    public readonly weatherSecond: FieldDefinition<OptionFieldModel> = this.schema.conditionsFields.conditionsWeatherSecond;
    public readonly roadSurface: FieldDefinition<OptionFieldModel> = this.schema.conditionsFields.conditionsRoadSurface;
    public readonly mannerOfCollision: FieldDefinition<OptionFieldModel> = this.schema.conditionsFields.conditionsMannerOfCollision;

    public getLight(): OptionFieldModel { return this.get<OptionFieldModel>(this.light); }
    public getWeatherFirst(): OptionFieldModel { return this.get<OptionFieldModel>(this.weatherFirst); }
    public getWeatherSecond(): OptionFieldModel { return this.get<OptionFieldModel>(this.weatherSecond); }
    public getRoadSurface(): OptionFieldModel { return this.get<OptionFieldModel>(this.roadSurface); }
    public getMannerOfCollision(): OptionFieldModel { return this.get<OptionFieldModel>(this.mannerOfCollision); }
}
