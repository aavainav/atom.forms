import { PageModel, SectionDefinition } from "@forms/core";
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
    private formSchema: PublicContactOrWarningFormSchema = this.getSchema<PublicContactOrWarningFormSchema>();

    public readonly agencySection: SectionDefinition<AgencySectionModel> = this.formSchema.agencySection;
    public readonly personSection: SectionDefinition<PersonSectionModel> = this.formSchema.personSection;
    public readonly routeSection: SectionDefinition<RouteSectionModel> = this.formSchema.routeSection;
    public readonly stopSection: SectionDefinition<StopSectionModel> = this.formSchema.stopSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.formSchema.vehicleSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.formSchema.officerSection;
    public readonly natureOfContactSection: SectionDefinition<NatureOfContactSectionModel> = this.formSchema.natureOfContactSection;
    public readonly primaryReasonSection: SectionDefinition<PrimaryReasonSectionModel> = this.formSchema.primaryReasonSection;
    public readonly searchesSection: SectionDefinition<SearchesSectionModel> = this.formSchema.searchesSection;

    /** Initializes the page and registers its person/vehicle dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        const personDropzone = new RecordPagePersonDropzone(page, this.formSchema);
        const vehicleDropzone = new RecordPageVehicleDropzone(page, this.formSchema);

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
