import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";
import { DetailPageOwnerDropzone } from "./dropzones/detail-page-owner-dropzone";
import { NotesSectionModel } from "./notes-section";
import { RecordSectionModel } from "./record-section";
import { RegisteredOwnerSectionModel } from "./registered-owner-section";
import { VehicleDetailSectionModel } from "./vehicle-detail-section";

export interface IDetailPage {
}

export interface IDetailPageModel extends IDetailPage {
}

/** Represents the detail page of the parking violation form, carrying the registered owner and the vehicle's description. */
export class DetailPageModel extends PageModel implements IDetailPageModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

    public readonly recordSection: SectionDefinition<RecordSectionModel> = this.schema.recordSection;
    public readonly registeredOwnerSection: SectionDefinition<RegisteredOwnerSectionModel> = this.schema.registeredOwnerSection;
    public readonly vehicleDetailSection: SectionDefinition<VehicleDetailSectionModel> = this.schema.vehicleDetailSection;
    public readonly notesSection: SectionDefinition<NotesSectionModel> = this.schema.notesSection;

    /** Initializes the page and registers its registered owner dropzone. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new DetailPageOwnerDropzone(page, page.schema));

        return page;
    }

    public getNotesSection(): NotesSectionModel { return this.get<NotesSectionModel>(this.notesSection); }
    public getRecordSection(): RecordSectionModel { return this.get<RecordSectionModel>(this.recordSection); }
    public getRegisteredOwnerSection(): RegisteredOwnerSectionModel { return this.get<RegisteredOwnerSectionModel>(this.registeredOwnerSection); }
    public getVehicleDetailSection(): VehicleDetailSectionModel { return this.get<VehicleDetailSectionModel>(this.vehicleDetailSection); }
}
