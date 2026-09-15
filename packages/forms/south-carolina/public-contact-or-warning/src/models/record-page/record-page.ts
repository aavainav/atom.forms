import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";
import { AgencySectionModel } from "./agency-section";
import { PersonSectionModel } from "./person-section";
import { RouteSectionModel } from "./route-section";
import { StopSectionModel } from "./stop-section";
import { VehicleSectionModel } from "./vehicle-section";
import { OfficerSectionModel } from "./officer-section";
import { NatureOfContactSectionModel } from "./nature-of-contact-section";
import { PrimaryReasonSectionModel } from "./primary-reason-section";
import { SearchesSectionModel } from "./searches-section";
import { RecordPagePersonDropzone } from "./dropzones/record-page-person-dropzone";
import { RecordPageVehicleDropzone } from "./dropzones/record-page-vehicle-dropzone";

export interface IRecordPage {
}

export interface IRecordPageModel extends IRecordPage {
}

/** Represents the single page of the public contact/warning record, providing access to all of its sections. */
export class RecordPageModel extends PageModel implements IRecordPageModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(RecordPageModel);

    public readonly agencySection: SectionDefinition<AgencySectionModel> = this.schema.agencySection;
    public readonly personSection: SectionDefinition<PersonSectionModel> = this.schema.personSection;
    public readonly routeSection: SectionDefinition<RouteSectionModel> = this.schema.routeSection;
    public readonly stopSection: SectionDefinition<StopSectionModel> = this.schema.stopSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.schema.vehicleSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.schema.officerSection;
    public readonly natureOfContactSection: SectionDefinition<NatureOfContactSectionModel> = this.schema.natureOfContactSection;
    public readonly primaryReasonSection: SectionDefinition<PrimaryReasonSectionModel> = this.schema.primaryReasonSection;
    public readonly searchesSection: SectionDefinition<SearchesSectionModel> = this.schema.searchesSection;

    /** Initializes the page and registers its person/vehicle dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        const personDropzone = new RecordPagePersonDropzone(page, this.schema);
        const vehicleDropzone = new RecordPageVehicleDropzone(page, this.schema);

        page = page.setDropzone(personDropzone);
        page = page.setDropzone(vehicleDropzone);

        return page;
    }

    public getAgencySection(): AgencySectionModel { return this.get<AgencySectionModel>(this.agencySection); }
    public getPersonSection(): PersonSectionModel { return this.get<PersonSectionModel>(this.personSection); }
    public getRouteSection(): RouteSectionModel { return this.get<RouteSectionModel>(this.routeSection); }
    public getStopSection(): StopSectionModel { return this.get<StopSectionModel>(this.stopSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getOfficerSection(): OfficerSectionModel { return this.get<OfficerSectionModel>(this.officerSection); }
    public getNatureOfContactSection(): NatureOfContactSectionModel { return this.get<NatureOfContactSectionModel>(this.natureOfContactSection); }
    public getPrimaryReasonSection(): PrimaryReasonSectionModel { return this.get<PrimaryReasonSectionModel>(this.primaryReasonSection); }
    public getSearchesSection(): SearchesSectionModel { return this.get<SearchesSectionModel>(this.searchesSection); }
}
