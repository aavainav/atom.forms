import { FormModel, PageModel, SectionDefinition } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";
import { PersonHeaderSectionModel } from "./person-header-section";
import { PersonSectionModel } from "./person-section";
import { DriverLicenseSectionModel } from "./driver-license-section";
import { DriverActionsSectionModel } from "./driver-actions-section";
import { OccupantSectionModel } from "./occupant-section";
import { NonMotoristSectionModel } from "./non-motorist-section";
import { InjurySectionModel } from "./injury-section";
import { SafetyEquipmentSectionModel } from "./safety-equipment-section";
import { AlcoholDrugsSectionModel } from "./alcohol-drugs-section";
import { PassengersSectionModel } from "./passengers-section";
import { PersonOfficerSectionModel } from "./person-officer-section";
import { PersonPagePersonDropzone } from "./dropzones/person-page-person-dropzone";

export interface IPersonPage {
}

export interface IPersonPageModel extends IPersonPage {
}

/** Represents one person page of the TR-310. The report carries a page per driver and non-motorist involved, so the form holds as many of these as the collision had people. */
export class PersonPageModel extends PageModel implements IPersonPageModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(PersonPageModel);

    public readonly personHeaderSection: SectionDefinition<PersonHeaderSectionModel> = this.schema.personHeaderSection;
    public readonly personSection: SectionDefinition<PersonSectionModel> = this.schema.personSection;
    public readonly driverLicenseSection: SectionDefinition<DriverLicenseSectionModel> = this.schema.driverLicenseSection;
    public readonly driverActionsSection: SectionDefinition<DriverActionsSectionModel> = this.schema.driverActionsSection;
    public readonly occupantSection: SectionDefinition<OccupantSectionModel> = this.schema.occupantSection;
    public readonly nonMotoristSection: SectionDefinition<NonMotoristSectionModel> = this.schema.nonMotoristSection;
    public readonly injurySection: SectionDefinition<InjurySectionModel> = this.schema.injurySection;
    public readonly safetyEquipmentSection: SectionDefinition<SafetyEquipmentSectionModel> = this.schema.safetyEquipmentSection;
    public readonly alcoholDrugsSection: SectionDefinition<AlcoholDrugsSectionModel> = this.schema.alcoholDrugsSection;
    public readonly passengersSection: SectionDefinition<PassengersSectionModel> = this.schema.passengersSection;
    public readonly personOfficerSection: SectionDefinition<PersonOfficerSectionModel> = this.schema.personOfficerSection;

    /** Initializes the page, registers its dropzone, and stamps it with an id of its own that survives every save. */
    public async initialize(): Promise<this> {
        let page = await super.initialize();

        page = page.setDropzone(new PersonPagePersonDropzone(page, this.schema));

        const header = page.get<PersonHeaderSectionModel>(page.personHeaderSection);
        return page.set(page.personHeaderSection, header.set(header.personId, header.getPersonId().setValue(crypto.randomUUID())));
    }

    public getPersonHeaderSection(): PersonHeaderSectionModel { return this.get<PersonHeaderSectionModel>(this.personHeaderSection); }
    public getPersonSection(): PersonSectionModel { return this.get<PersonSectionModel>(this.personSection); }
    public getDriverLicenseSection(): DriverLicenseSectionModel { return this.get<DriverLicenseSectionModel>(this.driverLicenseSection); }
    public getDriverActionsSection(): DriverActionsSectionModel { return this.get<DriverActionsSectionModel>(this.driverActionsSection); }
    public getOccupantSection(): OccupantSectionModel { return this.get<OccupantSectionModel>(this.occupantSection); }
    public getNonMotoristSection(): NonMotoristSectionModel { return this.get<NonMotoristSectionModel>(this.nonMotoristSection); }
    public getInjurySection(): InjurySectionModel { return this.get<InjurySectionModel>(this.injurySection); }
    public getSafetyEquipmentSection(): SafetyEquipmentSectionModel { return this.get<SafetyEquipmentSectionModel>(this.safetyEquipmentSection); }
    public getAlcoholDrugsSection(): AlcoholDrugsSectionModel { return this.get<AlcoholDrugsSectionModel>(this.alcoholDrugsSection); }
    public getPassengersSection(): PassengersSectionModel { return this.get<PassengersSectionModel>(this.passengersSection); }
    public getPersonOfficerSection(): PersonOfficerSectionModel { return this.get<PersonOfficerSectionModel>(this.personOfficerSection); }
}
