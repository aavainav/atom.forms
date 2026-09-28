import { FormModel, PageModel, SectionDefinition } from "@forms/core";
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
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(UnitPageModel);

    public readonly unitHeaderSection: SectionDefinition<UnitHeaderSectionModel> = this.schema.unitHeaderSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.schema.vehicleSection;
    public readonly insuranceSection: SectionDefinition<InsuranceSectionModel> = this.schema.insuranceSection;
    public readonly ownerSection: SectionDefinition<OwnerSectionModel> = this.schema.ownerSection;
    public readonly travelSection: SectionDefinition<TravelSectionModel> = this.schema.travelSection;
    public readonly damageSection: SectionDefinition<DamageSectionModel> = this.schema.damageSection;
    public readonly unitTypeSection: SectionDefinition<UnitTypeSectionModel> = this.schema.unitTypeSection;
    public readonly eventsSection: SectionDefinition<EventsSectionModel> = this.schema.eventsSection;
    public readonly roadwaySection: SectionDefinition<RoadwaySectionModel> = this.schema.roadwaySection;
    public readonly violationsSection: SectionDefinition<ViolationsSectionModel> = this.schema.violationsSection;
    public readonly unitOfficerSection: SectionDefinition<UnitOfficerSectionModel> = this.schema.unitOfficerSection;

    /** Initializes the page, registers its dropzones, and stamps it with an id of its own that survives every save. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new UnitPageVehicleDropzone(page, this.schema));
        page = page.setDropzone(new UnitPageOwnerDropzone(page, this.schema));

        const header = page.get<UnitHeaderSectionModel>(page.unitHeaderSection);
        return page.set(page.unitHeaderSection, header.set(header.unitId, header.getUnitId().setValue(crypto.randomUUID())));
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
