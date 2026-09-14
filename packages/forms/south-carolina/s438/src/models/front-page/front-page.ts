import { PageModel, SectionDefinition } from "@forms/core";
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
    private formSchema: S438FormSchema = this.getSchema<S438FormSchema>();
    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.formSchema.headerSection;
    public readonly violatorSection: SectionDefinition<ViolatorSectionModel> = this.formSchema.violatorSection;
    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.formSchema.violationSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.formSchema.vehicleSection;
    public readonly ownerSection: SectionDefinition<OwnerSectionModel> = this.formSchema.ownerSection;
    public readonly courtSection: SectionDefinition<CourtSectionModel> = this.formSchema.courtSection;
    public readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel> = this.formSchema.violationLocationSection;
    public readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel> = this.formSchema.arrestingOfficerSection;
    public readonly footerSection: SectionDefinition<FooterSectionModel> = this.formSchema.footerSection;

    /** Initializes the page and registers its person/vehicle/violation dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        const violatorDropzone = new FrontPageViolatorDropzone(page, this.formSchema);
        const ownerDropzone = new FrontPageOwnerDropzone(page, this.formSchema);
        const vehicleDropzone = new FrontPageVehicleDropzone(page, this.formSchema);
        const violationDropzone = new FrontPageViolationDropzone(page, this.formSchema);

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
