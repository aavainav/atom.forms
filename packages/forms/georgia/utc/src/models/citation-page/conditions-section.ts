import { ISection, BooleanFieldModel, FieldDefinition, FormModel, SectionModel } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { selectExclusive } from "../exclusive-group";

export interface IConditionsSection extends ISection {
}

export interface IConditionsSectionModel extends IConditionsSection {
}

/**
 * Represents the model for the conditions bar printed across the foot of Section II.
 *
 * The bar prints five columns - weather, road, surface, traffic and lighting - each a row of boxes answering one
 * question, so each is an exclusive group. The commercial violation column beside them is three separate flags
 * rather than a group: a load can be both hazardous and carried by a commercial vehicle.
 *
 * The paper heads two adjacent columns "(A) ROAD (B)", the first the road's condition and the second its surface;
 * they are held here as the separate `road` and `surface` groups.
 */
export class ConditionsSectionModel extends SectionModel implements IConditionsSectionModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(ConditionsSectionModel);

    public readonly weatherClear: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsWeatherClear;
    public readonly weatherCloudy: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsWeatherCloudy;
    public readonly weatherRaining: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsWeatherRaining;
    public readonly weatherOther: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsWeatherOther;
    public readonly roadDry: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsRoadDry;
    public readonly roadWet: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsRoadWet;
    public readonly roadIce: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsRoadIce;
    public readonly roadOther: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsRoadOther;
    public readonly surfaceConcrete: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsSurfaceConcrete;
    public readonly surfaceBlacktop: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsSurfaceBlacktop;
    public readonly surfaceDirt: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsSurfaceDirt;
    public readonly surfaceOther: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsSurfaceOther;
    public readonly trafficLight: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsTrafficLight;
    public readonly trafficMedium: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsTrafficMedium;
    public readonly trafficHeavy: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsTrafficHeavy;
    public readonly lightingDaylight: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsLightingDaylight;
    public readonly lightingDarkness: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsLightingDarkness;
    public readonly lightingOther: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsLightingOther;
    public readonly sixteenPlusPassengers: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsSixteenPlusPassengers;
    public readonly commercialVehicle: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsCommercialVehicle;
    public readonly hazardousMaterial: FieldDefinition<BooleanFieldModel> = this.schema.conditionsFields.conditionsHazardousMaterial;

    /** The daylight / darkness / other column. */
    public readonly lighting: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.lightingDaylight, this.lightingDarkness, this.lightingOther];
    /** The dry / wet / ice / other column, printed as "(A) ROAD". */
    public readonly road: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.roadDry, this.roadWet, this.roadIce, this.roadOther];
    /** The concrete / blacktop / dirt / other column, printed as "ROAD (B)". */
    public readonly surface: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.surfaceConcrete, this.surfaceBlacktop, this.surfaceDirt, this.surfaceOther];
    /** The light / medium / heavy column. */
    public readonly traffic: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.trafficLight, this.trafficMedium, this.trafficHeavy];
    /** The clear / cloudy / raining / other column. */
    public readonly weather: ReadonlyArray<FieldDefinition<BooleanFieldModel>> = [this.weatherClear, this.weatherCloudy, this.weatherRaining, this.weatherOther];

    public getCommercialVehicle(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.commercialVehicle); }
    public getHazardousMaterial(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.hazardousMaterial); }
    public getLightingDarkness(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.lightingDarkness); }
    public getLightingDaylight(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.lightingDaylight); }
    public getLightingOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.lightingOther); }
    public getRoadDry(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.roadDry); }
    public getRoadIce(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.roadIce); }
    public getRoadOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.roadOther); }
    public getRoadWet(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.roadWet); }
    public getSixteenPlusPassengers(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.sixteenPlusPassengers); }
    public getSurfaceBlacktop(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.surfaceBlacktop); }
    public getSurfaceConcrete(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.surfaceConcrete); }
    public getSurfaceDirt(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.surfaceDirt); }
    public getSurfaceOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.surfaceOther); }
    public getTrafficHeavy(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trafficHeavy); }
    public getTrafficLight(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trafficLight); }
    public getTrafficMedium(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.trafficMedium); }
    public getWeatherClear(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.weatherClear); }
    public getWeatherCloudy(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.weatherCloudy); }
    public getWeatherOther(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.weatherOther); }
    public getWeatherRaining(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.weatherRaining); }

    /** Returns a section with the given lighting condition checked and the rest of its column cleared. */
    public selectLighting(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.lighting, selected);
    }

    /** Returns a section with the given road condition checked and the rest of its column cleared. */
    public selectRoad(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.road, selected);
    }

    /** Returns a section with the given road surface checked and the rest of its column cleared. */
    public selectSurface(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.surface, selected);
    }

    /** Returns a section with the given traffic level checked and the rest of its column cleared. */
    public selectTraffic(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.traffic, selected);
    }

    /** Returns a section with the given weather condition checked and the rest of its column cleared. */
    public selectWeather(selected: FieldDefinition<BooleanFieldModel>): this {
        return selectExclusive(this, this.weather, selected);
    }
}
