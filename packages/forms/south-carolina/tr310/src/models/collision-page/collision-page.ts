import { PageModel, SectionDefinition } from "@forms/core";
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
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.formSchema.headerSection;
    public readonly collisionSection: SectionDefinition<CollisionSectionModel> = this.formSchema.collisionSection;
    public readonly routeSection: SectionDefinition<RouteSectionModel> = this.formSchema.routeSection;
    public readonly baseIntersectionSection: SectionDefinition<BaseIntersectionSectionModel> = this.formSchema.baseIntersectionSection;
    public readonly secondIntersectionSection: SectionDefinition<SecondIntersectionSectionModel> = this.formSchema.secondIntersectionSection;
    public readonly coordinatesSection: SectionDefinition<CoordinatesSectionModel> = this.formSchema.coordinatesSection;
    public readonly trafficwaySection: SectionDefinition<TrafficwaySectionModel> = this.formSchema.trafficwaySection;
    public readonly barrierSection: SectionDefinition<BarrierSectionModel> = this.formSchema.barrierSection;
    public readonly conditionsSection: SectionDefinition<ConditionsSectionModel> = this.formSchema.conditionsSection;
    public readonly harmfulEventSection: SectionDefinition<HarmfulEventSectionModel> = this.formSchema.harmfulEventSection;
    public readonly junctionSection: SectionDefinition<JunctionSectionModel> = this.formSchema.junctionSection;
    public readonly workZoneSection: SectionDefinition<WorkZoneSectionModel> = this.formSchema.workZoneSection;
    public readonly witnessSection: SectionDefinition<WitnessSectionModel> = this.formSchema.witnessSection;
    public readonly collisionOfficerSection: SectionDefinition<CollisionOfficerSectionModel> = this.formSchema.collisionOfficerSection;

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
