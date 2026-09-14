import { PageModel, SectionDefinition } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";
import { ComplaintPageDefendantDropzone } from "./dropzones/complaint-page-defendant-dropzone";
import { ComplaintPageVehicleDropzone } from "./dropzones/complaint-page-vehicle-dropzone";
import { ComplaintPageViolationDropzone } from "./dropzones/complaint-page-violation-dropzone";
import { ArraignmentSectionModel } from "./arraignment-section";
import { DefendantSectionModel } from "./defendant-section";
import { DescriptionSectionModel } from "./description-section";
import { HeaderSectionModel } from "./header-section";
import { LicenseSectionModel } from "./license-section";
import { OffenseSectionModel } from "./offense-section";
import { OfficerSectionModel } from "./officer-section";
import { SwornSectionModel } from "./sworn-section";
import { VehicleSectionModel } from "./vehicle-section";
import { ViolationInformationSectionModel } from "./violation-information-section";
import { ViolationSectionModel } from "./violation-section";

export interface IComplaintPage {
}

export interface IComplaintPageModel extends IComplaintPage {
}

/** Represents the complaint page of the traffic citation form, the complaint and information sworn by the issuing officer. */
export class ComplaintPageModel extends PageModel implements IComplaintPageModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly headerSection: SectionDefinition<HeaderSectionModel> = this.formSchema.headerSection;
    public readonly defendantSection: SectionDefinition<DefendantSectionModel> = this.formSchema.defendantSection;
    public readonly licenseSection: SectionDefinition<LicenseSectionModel> = this.formSchema.licenseSection;
    public readonly descriptionSection: SectionDefinition<DescriptionSectionModel> = this.formSchema.descriptionSection;
    public readonly vehicleSection: SectionDefinition<VehicleSectionModel> = this.formSchema.vehicleSection;
    public readonly violationSection: SectionDefinition<ViolationSectionModel> = this.formSchema.violationSection;
    public readonly offenseSection: SectionDefinition<OffenseSectionModel> = this.formSchema.offenseSection;
    public readonly violationInformationSection: SectionDefinition<ViolationInformationSectionModel> = this.formSchema.violationInformationSection;
    public readonly officerSection: SectionDefinition<OfficerSectionModel> = this.formSchema.officerSection;
    public readonly swornSection: SectionDefinition<SwornSectionModel> = this.formSchema.swornSection;
    public readonly arraignmentSection: SectionDefinition<ArraignmentSectionModel> = this.formSchema.arraignmentSection;

    /** Initializes the page and registers its defendant and vehicle dropzones. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new ComplaintPageDefendantDropzone(page, this.formSchema));
        page = page.setDropzone(new ComplaintPageVehicleDropzone(page, this.formSchema));
        page = page.setDropzone(new ComplaintPageViolationDropzone(page, this.formSchema));

        return page;
    }

    public getArraignmentSection(): ArraignmentSectionModel { return this.get<ArraignmentSectionModel>(this.arraignmentSection); }
    public getDefendantSection(): DefendantSectionModel { return this.get<DefendantSectionModel>(this.defendantSection); }
    public getDescriptionSection(): DescriptionSectionModel { return this.get<DescriptionSectionModel>(this.descriptionSection); }
    public getHeaderSection(): HeaderSectionModel { return this.get<HeaderSectionModel>(this.headerSection); }
    public getLicenseSection(): LicenseSectionModel { return this.get<LicenseSectionModel>(this.licenseSection); }
    public getOffenseSection(): OffenseSectionModel { return this.get<OffenseSectionModel>(this.offenseSection); }
    public getOfficerSection(): OfficerSectionModel { return this.get<OfficerSectionModel>(this.officerSection); }
    public getSwornSection(): SwornSectionModel { return this.get<SwornSectionModel>(this.swornSection); }
    public getVehicleSection(): VehicleSectionModel { return this.get<VehicleSectionModel>(this.vehicleSection); }
    public getViolationInformationSection(): ViolationInformationSectionModel { return this.get<ViolationInformationSectionModel>(this.violationInformationSection); }
    public getViolationSection(): ViolationSectionModel { return this.get<ViolationSectionModel>(this.violationSection); }
}
