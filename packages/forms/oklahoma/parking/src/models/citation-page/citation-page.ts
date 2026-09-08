import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";
import { CitationPageVehicleDropzone } from "./dropzones/citation-page-vehicle-dropzone";
import { CourtSectionModel } from "./court-section";
import { OfficerSectionModel } from "./officer-section";
import { PaymentSectionModel } from "./payment-section";
import { VehicleSectionModel } from "./vehicle-section";
import { ViolationSectionModel } from "./violation-section";

export interface ICitationPage {
}

export interface ICitationPageModel extends ICitationPage {
}

/** Represents the citation page of the parking violation form, the copy left on the vehicle. */
export class CitationPageModel extends PageModel implements ICitationPageModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(OKParkingFormSchema);

    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.schema.violationSection;
    public readonly paymentSection: SectionDefinition<PaymentSectionModel> = this.schema.paymentSection;
    public readonly courtSection: SectionDefinition<CourtSectionModel> = this.schema.courtSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.schema.vehicleSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.schema.officerSection;

    /** Initializes the page and registers its vehicle dropzone. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new CitationPageVehicleDropzone(page, page.schema));

        return page;
    }

    public getCourtSection(): CourtSectionModel { return this.get<CourtSectionModel>(this.courtSection); }
    public getOfficerSection(): OfficerSectionModel { return this.get<OfficerSectionModel>(this.officerSection); }
    public getPaymentSection(): PaymentSectionModel { return this.get<PaymentSectionModel>(this.paymentSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getViolationSection(): ViolationSectionModel { return this.get<ViolationSectionModel>(this.violationSection); }
}
