import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";
import { HeaderSectionModel } from "./header-section";
import { CollisionSectionModel } from "./collision-section";
import { RouteSectionModel } from "./route-section";
import { BaseIntersectionSectionModel } from "./base-intersection-section";
import { SecondIntersectionSectionModel } from "./second-intersection-section";
import { CoordinatesSectionModel } from "./coordinates-section";
import { TrafficwaySectionModel } from "./trafficway-section";
import { BarrierSectionModel } from "./barrier-section";
import { ConditionsSectionModel } from "./conditions-section";
import { HarmfulEventSectionModel } from "./harmful-event-section";
import { JunctionSectionModel } from "./junction-section";
import { WorkZoneSectionModel } from "./work-zone-section";
import { WitnessSectionModel } from "./witness-section";
import { CollisionOfficerSectionModel } from "./collision-officer-section";

export interface ICollisionPage {
}

export interface ICollisionPageModel extends ICollisionPage {
}

/** Represents the collision page of the TR-310, the one page describing the collision itself rather than a person or a unit. */
export class CollisionPageModel extends PageModel implements ICollisionPageModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.schema.headerSection;
    public readonly collisionSection: SectionDefinition<CollisionSectionModel> = this.schema.collisionSection;
    public readonly routeSection: SectionDefinition<RouteSectionModel> = this.schema.routeSection;
    public readonly baseIntersectionSection: SectionDefinition<BaseIntersectionSectionModel> = this.schema.baseIntersectionSection;
    public readonly secondIntersectionSection: SectionDefinition<SecondIntersectionSectionModel> = this.schema.secondIntersectionSection;
    public readonly coordinatesSection: SectionDefinition<CoordinatesSectionModel> = this.schema.coordinatesSection;
    public readonly trafficwaySection: SectionDefinition<TrafficwaySectionModel> = this.schema.trafficwaySection;
    public readonly barrierSection: SectionDefinition<BarrierSectionModel> = this.schema.barrierSection;
    public readonly conditionsSection: SectionDefinition<ConditionsSectionModel> = this.schema.conditionsSection;
    public readonly harmfulEventSection: SectionDefinition<HarmfulEventSectionModel> = this.schema.harmfulEventSection;
    public readonly junctionSection: SectionDefinition<JunctionSectionModel> = this.schema.junctionSection;
    public readonly workZoneSection: SectionDefinition<WorkZoneSectionModel> = this.schema.workZoneSection;
    public readonly witnessSection: SectionDefinition<WitnessSectionModel> = this.schema.witnessSection;
    public readonly collisionOfficerSection: SectionDefinition<CollisionOfficerSectionModel> = this.schema.collisionOfficerSection;

    public getHeaderSection(): HeaderSectionModel { return this.get<HeaderSectionModel>(this.headerSection); }
    public getCollisionSection(): CollisionSectionModel { return this.get<CollisionSectionModel>(this.collisionSection); }
    public getRouteSection(): RouteSectionModel { return this.get<RouteSectionModel>(this.routeSection); }
    public getBaseIntersectionSection(): BaseIntersectionSectionModel { return this.get<BaseIntersectionSectionModel>(this.baseIntersectionSection); }
    public getSecondIntersectionSection(): SecondIntersectionSectionModel { return this.get<SecondIntersectionSectionModel>(this.secondIntersectionSection); }
    public getCoordinatesSection(): CoordinatesSectionModel { return this.get<CoordinatesSectionModel>(this.coordinatesSection); }
    public getTrafficwaySection(): TrafficwaySectionModel { return this.get<TrafficwaySectionModel>(this.trafficwaySection); }
    public getBarrierSection(): BarrierSectionModel { return this.get<BarrierSectionModel>(this.barrierSection); }
    public getConditionsSection(): ConditionsSectionModel { return this.get<ConditionsSectionModel>(this.conditionsSection); }
    public getHarmfulEventSection(): HarmfulEventSectionModel { return this.get<HarmfulEventSectionModel>(this.harmfulEventSection); }
    public getJunctionSection(): JunctionSectionModel { return this.get<JunctionSectionModel>(this.junctionSection); }
    public getWorkZoneSection(): WorkZoneSectionModel { return this.get<WorkZoneSectionModel>(this.workZoneSection); }
    public getWitnessSection(): WitnessSectionModel { return this.get<WitnessSectionModel>(this.witnessSection); }
    public getCollisionOfficerSection(): CollisionOfficerSectionModel { return this.get<CollisionOfficerSectionModel>(this.collisionOfficerSection); }
}
