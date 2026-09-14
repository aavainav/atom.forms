import { PageModel, SectionDefinition } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";
import { CitationPageVehicleDropzone } from "./dropzones/citation-page-vehicle-dropzone";
import { CitationPageViolationDropzone } from "./dropzones/citation-page-violation-dropzone";
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
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.formSchema.violationSection;
    public readonly paymentSection: SectionDefinition<PaymentSectionModel> = this.formSchema.paymentSection;
    public readonly courtSection: SectionDefinition<CourtSectionModel> = this.formSchema.courtSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.formSchema.vehicleSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.formSchema.officerSection;

    /** Initializes the page and registers its vehicle dropzone. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new CitationPageVehicleDropzone(page, this.formSchema));
        page = page.setDropzone(new CitationPageViolationDropzone(page, this.formSchema));

        return page;
    }

    public getCourtSection(): CourtSectionModel { return this.get<CourtSectionModel>(this.courtSection); }
    public getOfficerSection(): OfficerSectionModel { return this.get<OfficerSectionModel>(this.officerSection); }
    public getPaymentSection(): PaymentSectionModel { return this.get<PaymentSectionModel>(this.paymentSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getViolationSection(): ViolationSectionModel { return this.get<ViolationSectionModel>(this.violationSection); }
}
