import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { S438FormSchema } from "../s438-form-schema";
import { TrialPageOwnerDropzone } from "./dropzones/trial-page-owner-dropzone";
import { TrialPageVehicleDropzone } from "./dropzones/trial-page-vehicle-dropzone";
import { TrialPageViolationDropzone } from "./dropzones/trial-page-violation-dropzone";
import { TrialPageViolatorDropzone } from "./dropzones/trial-page-violator-dropzone";
import { TrialArrestingOfficerSectionModel } from "./arresting-officer-section";
import { TrialCourtInformationSectionModel } from "./court-information-section";
import { TrialCourtSectionModel } from "./court-section";
import { TrialFooterSectionModel } from "./footer-section";
import { TrialHeaderSectionModel } from "./header-section";
import { TrialOwnerSectionModel } from "./owner-section";
import { TrialVehicleSectionModel } from "./vehicle-section";
import { TrialViolationLocationSectionModel } from "./violation-location-section";
import { TrialViolationSectionModel } from "./violation-section";
import { TrialViolatorSectionModel } from "./violator-section";

export interface ITrialPage {
}

export interface ITrialPageModel extends ITrialPage {
}

/** Represents the trial page of the s438 form -- the court's copy of the ticket -- providing access to its sections and their dropzones. */
export class TrialPageModel extends PageModel implements ITrialPageModel {
    private schema: S438FormSchema = FormModel.getSchema<S438FormSchema>(TrialPageModel);
    public readonly headerSection: SectionDefinition<TrialHeaderSectionModel> = this.schema.trialHeaderSection;
    public readonly violatorSection: SectionDefinition<TrialViolatorSectionModel> = this.schema.trialViolatorSection;
    public readonly vehicleSection: SectionDefinition<TrialVehicleSectionModel> = this.schema.trialVehicleSection;
    public readonly ownerSection: SectionDefinition<TrialOwnerSectionModel> = this.schema.trialOwnerSection;
    public readonly courtSection: SectionDefinition<TrialCourtSectionModel> = this.schema.trialCourtSection;
    public readonly violationSection: SectionDefinition<TrialViolationSectionModel> = this.schema.trialViolationSection;
    public readonly violationLocationSection: SectionDefinition<TrialViolationLocationSectionModel> = this.schema.trialViolationLocationSection;
    public readonly arrestingOfficerSection: SectionDefinition<TrialArrestingOfficerSectionModel> = this.schema.trialArrestingOfficerSection;
    public readonly courtInformationSection: SectionDefinition<TrialCourtInformationSectionModel> = this.schema.trialCourtInformationSection;
    public readonly footerSection: SectionDefinition<TrialFooterSectionModel> = this.schema.trialFooterSection;

    /** Initializes the page and registers its person/vehicle/violation dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new TrialPageViolatorDropzone(page, this.schema));
        page = page.setDropzone(new TrialPageOwnerDropzone(page, this.schema));
        page = page.setDropzone(new TrialPageVehicleDropzone(page, this.schema));
        page = page.setDropzone(new TrialPageViolationDropzone(page, this.schema));

        return page;
    }

    public getHeaderSection(): TrialHeaderSectionModel { return this.get<TrialHeaderSectionModel>(this.headerSection); }
    public getViolatorSection(): TrialViolatorSectionModel { return this.get<TrialViolatorSectionModel>(this.violatorSection); }
    public getVehicleSection(): TrialVehicleSectionModel { return this.get<TrialVehicleSectionModel>(this.vehicleSection); }
    public getOwnerSection(): TrialOwnerSectionModel { return this.get<TrialOwnerSectionModel>(this.ownerSection); }
    public getCourtSection(): TrialCourtSectionModel { return this.get<TrialCourtSectionModel>(this.courtSection); }
    public getViolationSection(): TrialViolationSectionModel { return this.get<TrialViolationSectionModel>(this.violationSection); }
    public getViolationLocationSection(): TrialViolationLocationSectionModel { return this.get<TrialViolationLocationSectionModel>(this.violationLocationSection); }
    public getArrestingOfficerSection(): TrialArrestingOfficerSectionModel { return this.get<TrialArrestingOfficerSectionModel>(this.arrestingOfficerSection); }
    public getCourtInformationSection(): TrialCourtInformationSectionModel { return this.get<TrialCourtInformationSectionModel>(this.courtInformationSection); }
    public getFooterSection(): TrialFooterSectionModel { return this.get<TrialFooterSectionModel>(this.footerSection); }
}
