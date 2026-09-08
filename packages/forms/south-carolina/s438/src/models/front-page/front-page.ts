import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";
import { FrontPageOwnerDropzone } from "./dropzones/front-page-owner-dropzone";
import { FrontPageVehicleDropzone } from "./dropzones/front-page-vehicle-dropzone";
import { FrontPageViolationDropzone } from "./dropzones/front-page-violation-dropzone";
import { FrontPageViolatorDropzone } from "./dropzones/front-page-violator-dropzone";
import { ArrestingOfficerSectionModel } from "./arresting-officer-section";
import { CourtSectionModel } from "./court-section";
import { FooterSectionModel } from "./footer-section";
import { HeaderSectionModel } from "./header-section";
import { OwnerSectionModel } from "./owner-section";
import { VehicleSectionModel } from "./vehicle-section";
import { ViolatorSectionModel } from "./violator-section";
import { ViolationLocationSectionModel } from "./violation-location-section";
import { ViolationSectionModel } from "./violation-section";

export interface IFrontPage {
}

export interface IFrontPageModel extends IFrontPage {
}

/** Represents the front page of the s438 form, providing access to its sections and their dropzones. */
export class FrontPageModel extends PageModel implements IFrontPageModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(S438FormSchema);
    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.schema.headerSection;
    public readonly violatorSection: SectionDefinition<ViolatorSectionModel> = this.schema.violatorSection;
    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.schema.violationSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.schema.vehicleSection;
    public readonly ownerSection: SectionDefinition<OwnerSectionModel> = this.schema.ownerSection;
    public readonly courtSection: SectionDefinition<CourtSectionModel> = this.schema.courtSection;
    public readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel> = this.schema.violationLocationSection;
    public readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel> = this.schema.arrestingOfficerSection;
    public readonly footerSection: SectionDefinition<FooterSectionModel> = this.schema.footerSection;

    /** Initializes the page and registers its person/vehicle/violation dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        const violatorDropzone = new FrontPageViolatorDropzone(page, page.schema);
        const ownerDropzone = new FrontPageOwnerDropzone(page, page.schema);
        const vehicleDropzone = new FrontPageVehicleDropzone(page, page.schema);
        const violationDropzone = new FrontPageViolationDropzone(page, page.schema);

        page = page.setDropzone(violatorDropzone);
        page = page.setDropzone(ownerDropzone);
        page = page.setDropzone(vehicleDropzone);
        page = page.setDropzone(violationDropzone);

        return page;
    }

    public getHeaderSection(): HeaderSectionModel { return this.get<HeaderSectionModel>(this.headerSection); }
    public getViolatorSection(): ViolatorSectionModel { return this.get<ViolatorSectionModel>(this.violatorSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getViolationSection(): ViolationSectionModel { return this.get<ViolationSectionModel>(this.violationSection); }
    public getOwnerSection(): OwnerSectionModel { return this.get<OwnerSectionModel>(this.ownerSection); }
    public getCourtSection(): CourtSectionModel { return this.get<CourtSectionModel>(this.courtSection); }
    public getViolationLocationSection(): ViolationLocationSectionModel { return this.get<ViolationLocationSectionModel>(this.violationLocationSection); }
    public getArrestingOfficerSection(): ArrestingOfficerSectionModel { return this.get<ArrestingOfficerSectionModel>(this.arrestingOfficerSection); }
    public getFooterSection(): FooterSectionModel { return this.get<FooterSectionModel>(this.footerSection); }
}
