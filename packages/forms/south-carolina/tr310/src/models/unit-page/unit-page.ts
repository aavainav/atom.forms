import { PageModel, SectionDefinition } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";
import { UnitHeaderSectionModel } from "./unit-header-section";
import { VehicleSectionModel } from "./vehicle-section";
import { InsuranceSectionModel } from "./insurance-section";
import { OwnerSectionModel } from "./owner-section";
import { TravelSectionModel } from "./travel-section";
import { DamageSectionModel } from "./damage-section";
import { UnitTypeSectionModel } from "./unit-type-section";
import { EventsSectionModel } from "./events-section";
import { RoadwaySectionModel } from "./roadway-section";
import { ViolationsSectionModel } from "./violations-section";
import { UnitOfficerSectionModel } from "./unit-officer-section";
import { UnitPageVehicleDropzone } from "./dropzones/unit-page-vehicle-dropzone";
import { UnitPageOwnerDropzone } from "./dropzones/unit-page-owner-dropzone";

export interface IUnitPage {
}

export interface IUnitPageModel extends IUnitPage {
}

/** Represents one unit page of the TR-310. The report carries a page per unit involved, so the form holds as many of these as the collision had units. */
export class UnitPageModel extends PageModel implements IUnitPageModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly unitHeaderSection: SectionDefinition<UnitHeaderSectionModel> = this.formSchema.unitHeaderSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.formSchema.vehicleSection;
    public readonly insuranceSection: SectionDefinition<InsuranceSectionModel> = this.formSchema.insuranceSection;
    public readonly ownerSection: SectionDefinition<OwnerSectionModel> = this.formSchema.ownerSection;
    public readonly travelSection: SectionDefinition<TravelSectionModel> = this.formSchema.travelSection;
    public readonly damageSection: SectionDefinition<DamageSectionModel> = this.formSchema.damageSection;
    public readonly unitTypeSection: SectionDefinition<UnitTypeSectionModel> = this.formSchema.unitTypeSection;
    public readonly eventsSection: SectionDefinition<EventsSectionModel> = this.formSchema.eventsSection;
    public readonly roadwaySection: SectionDefinition<RoadwaySectionModel> = this.formSchema.roadwaySection;
    public readonly violationsSection: SectionDefinition<ViolationsSectionModel> = this.formSchema.violationsSection;
    public readonly unitOfficerSection: SectionDefinition<UnitOfficerSectionModel> = this.formSchema.unitOfficerSection;

    /** Initializes the page and registers its dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new UnitPageVehicleDropzone(page, this.formSchema));
        page = page.setDropzone(new UnitPageOwnerDropzone(page, this.formSchema));

        return page;
    }

    public getUnitHeaderSection(): UnitHeaderSectionModel { return this.get<UnitHeaderSectionModel>(this.unitHeaderSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getInsuranceSection(): InsuranceSectionModel { return this.get<InsuranceSectionModel>(this.insuranceSection); }
    public getOwnerSection(): OwnerSectionModel { return this.get<OwnerSectionModel>(this.ownerSection); }
    public getTravelSection(): TravelSectionModel { return this.get<TravelSectionModel>(this.travelSection); }
    public getDamageSection(): DamageSectionModel { return this.get<DamageSectionModel>(this.damageSection); }
    public getUnitTypeSection(): UnitTypeSectionModel { return this.get<UnitTypeSectionModel>(this.unitTypeSection); }
    public getEventsSection(): EventsSectionModel { return this.get<EventsSectionModel>(this.eventsSection); }
    public getRoadwaySection(): RoadwaySectionModel { return this.get<RoadwaySectionModel>(this.roadwaySection); }
    public getViolationsSection(): ViolationsSectionModel { return this.get<ViolationsSectionModel>(this.violationsSection); }
    public getUnitOfficerSection(): UnitOfficerSectionModel { return this.get<UnitOfficerSectionModel>(this.unitOfficerSection); }
}
