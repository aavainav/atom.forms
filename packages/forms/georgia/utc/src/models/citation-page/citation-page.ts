import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { GAUTCFormSchema } from "../utc-form-schema";
import { CitationPageVehicleDropzone } from "./dropzones/citation-page-vehicle-dropzone";
import { CitationPageViolationDropzone } from "./dropzones/citation-page-violation-dropzone";
import { CitationPageViolatorDropzone } from "./dropzones/citation-page-violator-dropzone";
import { CertificationSectionModel } from "./certification-section";
import { ConditionsSectionModel } from "./conditions-section";
import { DuiSectionModel } from "./dui-section";
import { HeaderSectionModel } from "./header-section";
import { LocationSectionModel } from "./location-section";
import { OffenseSectionModel } from "./offense-section";
import { OfficerSectionModel } from "./officer-section";
import { StatusSectionModel } from "./status-section";
import { SummonsSectionModel } from "./summons-section";
import { VehicleSectionModel } from "./vehicle-section";
import { ViolationSectionModel } from "./violation-section";
import { ViolatorSectionModel } from "./violator-section";

export interface ICitationPage {
}

export interface ICitationPageModel extends ICitationPage {
}

/** The citation page, the face of the printed form. Its twelve sections are the five the paper numbers I through V, split where a printed section holds more than one block of boxes. */
export class CitationPageModel extends PageModel implements ICitationPageModel {
    private schema: GAUTCFormSchema = FormModel.getSchema<GAUTCFormSchema>(CitationPageModel);

    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.schema.headerSection;
    public readonly violatorSection: SectionDefinition<ViolatorSectionModel> = this.schema.violatorSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.schema.vehicleSection;
    public readonly statusSection: SectionDefinition<StatusSectionModel> = this.schema.statusSection;
    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.schema.violationSection;
    public readonly duiSection: SectionDefinition<DuiSectionModel> = this.schema.duiSection;
    public readonly offenseSection: SectionDefinition<OffenseSectionModel> = this.schema.offenseSection;
    public readonly conditionsSection: SectionDefinition<ConditionsSectionModel> = this.schema.conditionsSection;
    public readonly locationSection: SectionDefinition<LocationSectionModel> = this.schema.locationSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.schema.officerSection;
    public readonly summonsSection: SectionDefinition<SummonsSectionModel> = this.schema.summonsSection;
    public readonly certificationSection: SectionDefinition<CertificationSectionModel> = this.schema.certificationSection;

    /** Initializes the page and registers its violator and vehicle dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new CitationPageViolatorDropzone(page, this.schema));
        page = page.setDropzone(new CitationPageVehicleDropzone(page, this.schema));
        page = page.setDropzone(new CitationPageViolationDropzone(page, this.schema));

        return page;
    }

    public getCertificationSection(): CertificationSectionModel { return this.get<CertificationSectionModel>(this.certificationSection); }
    public getConditionsSection(): ConditionsSectionModel { return this.get<ConditionsSectionModel>(this.conditionsSection); }
    public getDuiSection(): DuiSectionModel { return this.get<DuiSectionModel>(this.duiSection); }
    public getHeaderSection(): HeaderSectionModel { return this.get<HeaderSectionModel>(this.headerSection); }
    public getLocationSection(): LocationSectionModel { return this.get<LocationSectionModel>(this.locationSection); }
    public getOffenseSection(): OffenseSectionModel { return this.get<OffenseSectionModel>(this.offenseSection); }
    public getOfficerSection(): OfficerSectionModel { return this.get<OfficerSectionModel>(this.officerSection); }
    public getStatusSection(): StatusSectionModel { return this.get<StatusSectionModel>(this.statusSection); }
    public getSummonsSection(): SummonsSectionModel { return this.get<SummonsSectionModel>(this.summonsSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getViolationSection(): ViolationSectionModel { return this.get<ViolationSectionModel>(this.violationSection); }
    public getViolatorSection(): ViolatorSectionModel { return this.get<ViolatorSectionModel>(this.violatorSection); }
}
