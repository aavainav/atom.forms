import {
    defineFields,
    ISchema,
    BooleanFieldModel,
    DefinitionFactory,
    FieldDefinition,
    FormDefinition,
    NumberFieldModel,
    PageDefinition,
    RuleCollection,
    Schema,
    SectionDefinition,
    StringFieldModel
} from "@forms/core";
import { S438FormModel } from "./s438-form";
import { createRuleCollection } from "./s438-rules";
import { FrontPageModel } from "./front-page/front-page";
import { NoticePageModel } from "./notice-page/notice-page";
import { HeaderSectionModel } from "./front-page/header-section";
import { ViolatorSectionModel } from "./front-page/violator-section";
import { VehicleSectionModel } from "./front-page/vehicle-section";
import { OwnerSectionModel } from "./front-page/owner-section";
import { CourtSectionModel } from "./front-page/court-section";
import { ViolationSectionModel } from "./front-page/violation-section";
import { ViolationLocationSectionModel } from "./front-page/violation-location-section";
import { ArrestingOfficerSectionModel } from "./front-page/arresting-officer-section";
import { FooterSectionModel } from "./front-page/footer-section";
import { TrialPageModel } from "./trial-page/trial-page";
import { TrialArrestingOfficerSectionModel } from "./trial-page/arresting-officer-section";
import { TrialCourtInformationSectionModel } from "./trial-page/court-information-section";
import { TrialCourtSectionModel } from "./trial-page/court-section";
import { TrialFooterSectionModel } from "./trial-page/footer-section";
import { TrialHeaderSectionModel } from "./trial-page/header-section";
import { TrialOwnerSectionModel } from "./trial-page/owner-section";
import { TrialVehicleSectionModel } from "./trial-page/vehicle-section";
import { TrialViolationLocationSectionModel } from "./trial-page/violation-location-section";
import { TrialViolationSectionModel } from "./trial-page/violation-section";
import { TrialViolatorSectionModel } from "./trial-page/violator-section";

export interface IS438FormSchema extends ISchema {
    readonly frontPage: PageDefinition<FrontPageModel>;

    readonly headerSection: SectionDefinition<HeaderSectionModel>;

    readonly violatorSection: SectionDefinition<ViolatorSectionModel>;
    readonly violatorFields: {
        readonly violatorFirstName: FieldDefinition<StringFieldModel>;
        readonly violatorMiddleName: FieldDefinition<StringFieldModel>;
        readonly violatorLastName: FieldDefinition<StringFieldModel>;
        readonly violatorStreetAddress: FieldDefinition<StringFieldModel>;
        readonly violatorCity: FieldDefinition<StringFieldModel>;
        readonly violatorState: FieldDefinition<StringFieldModel>;
        readonly violatorZipCode: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseState: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly violatorDriverLicenseClass: FieldDefinition<StringFieldModel>;
        readonly violatorCommercialDriverLicenseYes: FieldDefinition<BooleanFieldModel>;
        readonly violatorCommercialDriverLicenseNo: FieldDefinition<BooleanFieldModel>;
        readonly violatorRace: FieldDefinition<StringFieldModel>;
        readonly violatorSex: FieldDefinition<StringFieldModel>;
        readonly violatorDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly violatorHeight: FieldDefinition<StringFieldModel>;
        readonly violatorWeight: FieldDefinition<NumberFieldModel>;
        readonly violatorHairColor: FieldDefinition<StringFieldModel>;
        readonly violatorEyeColor: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleLicenseState: FieldDefinition<StringFieldModel>;
        readonly vehicleMake: FieldDefinition<StringFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
        readonly vehicleAuto: FieldDefinition<BooleanFieldModel>;
        readonly vehicleBicycle: FieldDefinition<BooleanFieldModel>;
        readonly vehicleCombination: FieldDefinition<BooleanFieldModel>;
        readonly vehicleCommercialVehicle: FieldDefinition<BooleanFieldModel>;
        readonly vehicleHazardousMaterials: FieldDefinition<BooleanFieldModel>;
        readonly vehicleMoped: FieldDefinition<BooleanFieldModel>;
        readonly vehicleMotorcycle: FieldDefinition<BooleanFieldModel>;
        readonly vehiclePedestrian: FieldDefinition<BooleanFieldModel>;
        readonly vehicleOther: FieldDefinition<BooleanFieldModel>;
    };

    readonly ownerSection: SectionDefinition<OwnerSectionModel>;
    readonly ownerFields: {
        readonly ownerFirstName: FieldDefinition<StringFieldModel>;
        readonly ownerMiddleName: FieldDefinition<StringFieldModel>;
        readonly ownerLastName: FieldDefinition<StringFieldModel>;
        readonly ownerStreetAddress: FieldDefinition<StringFieldModel>;
        readonly ownerCity: FieldDefinition<StringFieldModel>;
        readonly ownerState: FieldDefinition<StringFieldModel>;
        readonly ownerZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly courtSection: SectionDefinition<CourtSectionModel>;
    readonly courtFields: {
        readonly courtName: FieldDefinition<StringFieldModel>;
        readonly courtStreetAddress: FieldDefinition<StringFieldModel>;
        readonly courtDateOfTrial: FieldDefinition<StringFieldModel>;
        readonly courtTimeOfTrial: FieldDefinition<StringFieldModel>;
        readonly courtCity: FieldDefinition<StringFieldModel>;
        readonly courtState: FieldDefinition<StringFieldModel>;
        readonly courtZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly violationSection: SectionDefinition<ViolationSectionModel>;
    readonly violationFields: {
        readonly violationSectionNumber: FieldDefinition<StringFieldModel>;
        readonly violationDescription: FieldDefinition<StringFieldModel>;
        readonly violationCourtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel>;
        readonly violationCourtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel>;
        readonly violationDateOfViolation: FieldDefinition<StringFieldModel>;
        readonly violationTimeOfViolation: FieldDefinition<StringFieldModel>;
        readonly violationScPoints: FieldDefinition<NumberFieldModel>;
        readonly violationBloodAlcoholLevel: FieldDefinition<StringFieldModel>;
        readonly violationSpeed: FieldDefinition<NumberFieldModel>;
        readonly violationSpeedLimit: FieldDefinition<NumberFieldModel>;
    };

    readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel>;
    readonly violationLocationFields: {
        readonly violationLocation: FieldDefinition<StringFieldModel>;
        readonly violationLocationCounty: FieldDefinition<StringFieldModel>;
        readonly violationLocationLatitude: FieldDefinition<StringFieldModel>;
        readonly violationLocationLongitude: FieldDefinition<StringFieldModel>;
        readonly violationLocationCity: FieldDefinition<StringFieldModel>;
    };

    readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel>;
    readonly arrestingOfficerFields: {
        readonly arrestingOfficerName: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerRank: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerSccjaOfficerNumber: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerBailDeposited: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerDateOfArrest: FieldDefinition<StringFieldModel>;
        readonly arrestingOfficerBondAmountRequested: FieldDefinition<StringFieldModel>;
    };

    readonly footerSection: SectionDefinition<FooterSectionModel>;
    readonly footerFields: {
        readonly footerTicketNumber: FieldDefinition<StringFieldModel>;
    };

    readonly trialPage: PageDefinition<TrialPageModel>;

    readonly trialHeaderSection: SectionDefinition<TrialHeaderSectionModel>;
    readonly trialHeaderFields: {
        readonly trialHeaderNotes: FieldDefinition<StringFieldModel>;
        readonly trialHeaderVoid: FieldDefinition<BooleanFieldModel>;
    };

    readonly trialViolatorSection: SectionDefinition<TrialViolatorSectionModel>;
    readonly trialViolatorFields: {
        readonly trialViolatorFirstName: FieldDefinition<StringFieldModel>;
        readonly trialViolatorMiddleName: FieldDefinition<StringFieldModel>;
        readonly trialViolatorLastName: FieldDefinition<StringFieldModel>;
        readonly trialViolatorStreetAddress: FieldDefinition<StringFieldModel>;
        readonly trialViolatorCity: FieldDefinition<StringFieldModel>;
        readonly trialViolatorState: FieldDefinition<StringFieldModel>;
        readonly trialViolatorZipCode: FieldDefinition<StringFieldModel>;
        readonly trialViolatorDriverLicenseState: FieldDefinition<StringFieldModel>;
        readonly trialViolatorDriverLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly trialViolatorDriverLicenseClass: FieldDefinition<StringFieldModel>;
        readonly trialViolatorCommercialDriverLicenseYes: FieldDefinition<BooleanFieldModel>;
        readonly trialViolatorCommercialDriverLicenseNo: FieldDefinition<BooleanFieldModel>;
        readonly trialViolatorRace: FieldDefinition<StringFieldModel>;
        readonly trialViolatorSex: FieldDefinition<StringFieldModel>;
        readonly trialViolatorDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly trialViolatorHeight: FieldDefinition<StringFieldModel>;
        readonly trialViolatorWeight: FieldDefinition<NumberFieldModel>;
        readonly trialViolatorHairColor: FieldDefinition<StringFieldModel>;
        readonly trialViolatorEyeColor: FieldDefinition<StringFieldModel>;
    };

    readonly trialVehicleSection: SectionDefinition<TrialVehicleSectionModel>;
    readonly trialVehicleFields: {
        readonly trialVehicleLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly trialVehicleLicenseState: FieldDefinition<StringFieldModel>;
        readonly trialVehicleMake: FieldDefinition<StringFieldModel>;
        readonly trialVehicleYear: FieldDefinition<NumberFieldModel>;
        readonly trialVehicleAuto: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleBicycle: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleCombination: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleCommercialVehicle: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleHazardousMaterials: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleMoped: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleMotorcycle: FieldDefinition<BooleanFieldModel>;
        readonly trialVehiclePedestrian: FieldDefinition<BooleanFieldModel>;
        readonly trialVehicleOther: FieldDefinition<BooleanFieldModel>;
    };

    readonly trialOwnerSection: SectionDefinition<TrialOwnerSectionModel>;
    readonly trialOwnerFields: {
        readonly trialOwnerFirstName: FieldDefinition<StringFieldModel>;
        readonly trialOwnerMiddleName: FieldDefinition<StringFieldModel>;
        readonly trialOwnerLastName: FieldDefinition<StringFieldModel>;
        readonly trialOwnerStreetAddress: FieldDefinition<StringFieldModel>;
        readonly trialOwnerCity: FieldDefinition<StringFieldModel>;
        readonly trialOwnerState: FieldDefinition<StringFieldModel>;
        readonly trialOwnerZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly trialCourtSection: SectionDefinition<TrialCourtSectionModel>;
    readonly trialCourtFields: {
        readonly trialCourtName: FieldDefinition<StringFieldModel>;
        readonly trialCourtStreetAddress: FieldDefinition<StringFieldModel>;
        readonly trialCourtDateOfTrial: FieldDefinition<StringFieldModel>;
        readonly trialCourtTimeOfTrial: FieldDefinition<StringFieldModel>;
        readonly trialCourtCity: FieldDefinition<StringFieldModel>;
        readonly trialCourtState: FieldDefinition<StringFieldModel>;
        readonly trialCourtZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly trialViolationSection: SectionDefinition<TrialViolationSectionModel>;
    readonly trialViolationFields: {
        readonly trialViolationSectionNumber: FieldDefinition<StringFieldModel>;
        readonly trialViolationDescription: FieldDefinition<StringFieldModel>;
        readonly trialViolationCourtAppearanceRequiredYes: FieldDefinition<BooleanFieldModel>;
        readonly trialViolationCourtAppearanceRequiredNo: FieldDefinition<BooleanFieldModel>;
        readonly trialViolationDateOfViolation: FieldDefinition<StringFieldModel>;
        readonly trialViolationTimeOfViolation: FieldDefinition<StringFieldModel>;
        readonly trialViolationScPoints: FieldDefinition<NumberFieldModel>;
        readonly trialViolationBloodAlcoholLevel: FieldDefinition<StringFieldModel>;
        readonly trialViolationSpeed: FieldDefinition<NumberFieldModel>;
        readonly trialViolationSpeedLimit: FieldDefinition<NumberFieldModel>;
    };

    readonly trialViolationLocationSection: SectionDefinition<TrialViolationLocationSectionModel>;
    readonly trialViolationLocationFields: {
        readonly trialViolationLocation: FieldDefinition<StringFieldModel>;
        readonly trialViolationLocationCounty: FieldDefinition<StringFieldModel>;
        readonly trialViolationLocationLatitude: FieldDefinition<StringFieldModel>;
        readonly trialViolationLocationLongitude: FieldDefinition<StringFieldModel>;
        readonly trialViolationLocationCity: FieldDefinition<StringFieldModel>;
    };

    readonly trialArrestingOfficerSection: SectionDefinition<TrialArrestingOfficerSectionModel>;
    readonly trialArrestingOfficerFields: {
        readonly trialArrestingOfficerName: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerRank: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerSccjaOfficerNumber: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerBailDeposited: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerDateOfArrest: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerBondAmountRequested: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerDateBailReceived: FieldDefinition<StringFieldModel>;
        readonly trialArrestingOfficerBailReceivedBy: FieldDefinition<StringFieldModel>;
    };

    readonly trialCourtInformationSection: SectionDefinition<TrialCourtInformationSectionModel>;
    readonly trialCourtInformationFields: {
        readonly trialCourtInformationCaseBeforeMagistrate: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCaseBeforeMunicipalCourt: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCaseBeforeCircuitCourt: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCaseBeforeFamilyCourt: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCaseBeforeFederalCourt: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCourtIfDifferent: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationTrialByJudge: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationTrialByJury: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationDefendantDidNotAppear: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationDefendantAppeared: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationDispositionDate: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationNolleProssed: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationGuilty: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationForfeitedBond: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationNotGuilty: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationPledNoloContendere: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationDeterminedBac: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationChargeConvictedOf: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationSameAsOriginal: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationScPoints: FieldDefinition<NumberFieldModel>;
        readonly trialCourtInformationJail: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationSuspend: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationFine: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationAmountCollected: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationAmountSuspended: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationCommittedTo: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationVehicleSearched: FieldDefinition<BooleanFieldModel>;
        readonly trialCourtInformationCertifiedCorrect: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationCertifiedDate: FieldDefinition<StringFieldModel>;
        readonly trialCourtInformationArrestResultOfCollision: FieldDefinition<BooleanFieldModel>;
    };

    readonly trialFooterSection: SectionDefinition<TrialFooterSectionModel>;
    readonly trialFooterFields: {
        readonly trialFooterTicketNumber: FieldDefinition<StringFieldModel>;
    };

    readonly noticePage: PageDefinition<NoticePageModel>;

    readonly ruleCollection: RuleCollection;
}

/** Represents the schema definition for the S438 form, defining its pages, sections, and fields. */
export class S438FormSchema extends Schema implements IS438FormSchema {
    readonly formDefinition: FormDefinition<S438FormModel> = DefinitionFactory.form<S438FormModel>("s438-form", S438FormModel, this);

    readonly frontPage: PageDefinition<FrontPageModel> = DefinitionFactory.page<FrontPageModel>("front-page", this.formDefinition, FrontPageModel);

    readonly headerSection: SectionDefinition<HeaderSectionModel> = DefinitionFactory.section<HeaderSectionModel>("header-section", this.frontPage, HeaderSectionModel, { isShared: true });

    readonly violatorSection: SectionDefinition<ViolatorSectionModel> = DefinitionFactory.section<ViolatorSectionModel>("violator-section", this.frontPage, ViolatorSectionModel, { isShared: true });
    readonly violatorFields = defineFields(this.violatorSection, {
        violatorFirstName: { label: "First Name", ctor: StringFieldModel },
        violatorMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        violatorLastName: { label: "Last Name", ctor: StringFieldModel },
        violatorStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        violatorCity: { label: "City", ctor: StringFieldModel },
        violatorState: { label: "State", ctor: StringFieldModel },
        violatorZipCode: { label: "Zip Code", ctor: StringFieldModel },
        violatorDriverLicenseState: { label: "DL State", ctor: StringFieldModel },
        violatorDriverLicenseNumber: { label: "Driver License No.", ctor: StringFieldModel },
        violatorDriverLicenseClass: { label: "Class", ctor: StringFieldModel },
        violatorCommercialDriverLicenseYes: { label: "Yes", ctor: BooleanFieldModel },
        violatorCommercialDriverLicenseNo: { label: "No", ctor: BooleanFieldModel },
        violatorRace: { label: "Race", ctor: StringFieldModel },
        violatorSex: { label: "Sex", ctor: StringFieldModel },
        violatorDateOfBirth: { label: "Date of Birth", ctor: StringFieldModel },
        violatorHeight: { label: "Height", ctor: StringFieldModel },
        violatorWeight: { label: "Weight", ctor: NumberFieldModel },
        violatorHairColor: { label: "Hair Color", ctor: StringFieldModel },
        violatorEyeColor: { label: "Eye Color", ctor: StringFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.frontPage, VehicleSectionModel, { isShared: true });
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleLicenseNumber: { label: "License Number", ctor: StringFieldModel },
        vehicleLicenseState: { label: "License State", ctor: StringFieldModel },
        vehicleMake: { label: "Make", ctor: StringFieldModel },
        vehicleYear: { label: "Year", ctor: NumberFieldModel },
        vehicleAuto: { label: "Auto", ctor: BooleanFieldModel },
        vehicleBicycle: { label: "Bicycle", ctor: BooleanFieldModel },
        vehicleCombination: { label: "Combination", ctor: BooleanFieldModel },
        vehicleCommercialVehicle: { label: "Commercial Vehicle", ctor: BooleanFieldModel },
        vehicleHazardousMaterials: { label: "Hazardous Materials", ctor: BooleanFieldModel },
        vehicleMoped: { label: "Moped", ctor: BooleanFieldModel },
        vehicleMotorcycle: { label: "Motorcycle", ctor: BooleanFieldModel },
        vehiclePedestrian: { label: "Pedestrian", ctor: BooleanFieldModel },
        vehicleOther: { label: "Other", ctor: BooleanFieldModel }
    });

    readonly ownerSection: SectionDefinition<OwnerSectionModel> = DefinitionFactory.section<OwnerSectionModel>("owner-section", this.frontPage, OwnerSectionModel, { isShared: true });
    readonly ownerFields = defineFields(this.ownerSection, {
        ownerFirstName: { label: "First Name", ctor: StringFieldModel },
        ownerMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        ownerLastName: { label: "Last Name", ctor: StringFieldModel },
        ownerStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        ownerCity: { label: "City", ctor: StringFieldModel },
        ownerState: { label: "State", ctor: StringFieldModel },
        ownerZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly courtSection: SectionDefinition<CourtSectionModel> = DefinitionFactory.section<CourtSectionModel>("court-section", this.frontPage, CourtSectionModel, { isShared: true });
    readonly courtFields = defineFields(this.courtSection, {
        courtName: { label: "Name of Trial Court", ctor: StringFieldModel },
        courtStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        courtDateOfTrial: { label: "Date of Trial", ctor: StringFieldModel },
        courtTimeOfTrial: { label: "Time of Trial", ctor: StringFieldModel },
        courtCity: { label: "City", ctor: StringFieldModel },
        courtState: { label: "State", ctor: StringFieldModel },
        courtZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly violationSection: SectionDefinition<ViolationSectionModel> = DefinitionFactory.section<ViolationSectionModel>("violation-section", this.frontPage, ViolationSectionModel);
    readonly violationFields = defineFields(this.violationSection, {
        violationSectionNumber: { label: "Violation Section No.", ctor: StringFieldModel },
        violationDescription: { label: "Violation - Court Appearance Required", ctor: StringFieldModel },
        violationCourtAppearanceRequiredYes: { label: "Court Appearance Required (Yes)", ctor: BooleanFieldModel },
        violationCourtAppearanceRequiredNo: { label: "Court Appearance Required (No)", ctor: BooleanFieldModel },
        violationDateOfViolation: { label: "Date of Violation", ctor: StringFieldModel },
        violationTimeOfViolation: { label: "Time of Viol.", ctor: StringFieldModel },
        violationScPoints: { label: "SC Points", ctor: NumberFieldModel },
        violationBloodAlcoholLevel: { label: "Blood Alcohol Level", ctor: StringFieldModel },
        violationSpeed: { label: "Speed", ctor: NumberFieldModel },
        violationSpeedLimit: { label: "Limit", ctor: NumberFieldModel }
    });

    readonly violationLocationSection: SectionDefinition<ViolationLocationSectionModel> = DefinitionFactory.section<ViolationLocationSectionModel>("violation-location-section", this.frontPage, ViolationLocationSectionModel, { isShared: true });
    readonly violationLocationFields = defineFields(this.violationLocationSection, {
        violationLocation: { label: "Violation Location", ctor: StringFieldModel },
        violationLocationCounty: { label: "County", ctor: StringFieldModel, name: "violation-county" },
        violationLocationLatitude: { label: "Latitude", ctor: StringFieldModel, name: "violation-latitude" },
        violationLocationLongitude: { label: "Longitude", ctor: StringFieldModel, name: "violation-longitude" },
        violationLocationCity: { label: "City", ctor: StringFieldModel, name: "violation-city" }
    });

    readonly arrestingOfficerSection: SectionDefinition<ArrestingOfficerSectionModel> = DefinitionFactory.section<ArrestingOfficerSectionModel>("arresting-officer-section", this.frontPage, ArrestingOfficerSectionModel, { isShared: true });
    readonly arrestingOfficerFields = defineFields(this.arrestingOfficerSection, {
        arrestingOfficerName: { label: "Name and Rank of Arresting Officer", ctor: StringFieldModel },
        arrestingOfficerRank: { label: "Rank", ctor: StringFieldModel },
        arrestingOfficerSccjaOfficerNumber: { label: "SCCJA Officer Number", ctor: StringFieldModel },
        arrestingOfficerBailDeposited: { label: "Bail Deposited", ctor: StringFieldModel },
        arrestingOfficerDateOfArrest: { label: "Date of Arrest", ctor: StringFieldModel },
        arrestingOfficerBondAmountRequested: { label: "Bond Amount Requested", ctor: StringFieldModel }
    });

    readonly footerSection: SectionDefinition<FooterSectionModel> = DefinitionFactory.section<FooterSectionModel>("footer-section", this.frontPage, FooterSectionModel, { isShared: true });
    readonly footerFields = defineFields(this.footerSection, {
        footerTicketNumber: { label: "Ticket Number", ctor: StringFieldModel }
    });

    // the court's copy of the ticket, written in place of the front pages on a trial citation: one page per charge,
    // as the front pages are, holding its own copy of everything the front page prints, plus the court's disposition
    readonly trialPage: PageDefinition<TrialPageModel> = DefinitionFactory.page<TrialPageModel>("trial-page", this.formDefinition, TrialPageModel);

    readonly trialHeaderSection: SectionDefinition<TrialHeaderSectionModel> = DefinitionFactory.section<TrialHeaderSectionModel>("trial-header-section", this.trialPage, TrialHeaderSectionModel, { isShared: true });
    readonly trialHeaderFields = defineFields(this.trialHeaderSection, {
        trialHeaderNotes: { label: "Notes", ctor: StringFieldModel },
        trialHeaderVoid: { label: "Void", ctor: BooleanFieldModel }
    });

    readonly trialViolatorSection: SectionDefinition<TrialViolatorSectionModel> = DefinitionFactory.section<TrialViolatorSectionModel>("trial-violator-section", this.trialPage, TrialViolatorSectionModel, { isShared: true });
    readonly trialViolatorFields = defineFields(this.trialViolatorSection, {
        trialViolatorFirstName: { label: "First Name", ctor: StringFieldModel },
        trialViolatorMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        trialViolatorLastName: { label: "Last Name", ctor: StringFieldModel },
        trialViolatorStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        trialViolatorCity: { label: "City", ctor: StringFieldModel },
        trialViolatorState: { label: "State", ctor: StringFieldModel },
        trialViolatorZipCode: { label: "Zip Code", ctor: StringFieldModel },
        trialViolatorDriverLicenseState: { label: "DL State", ctor: StringFieldModel },
        trialViolatorDriverLicenseNumber: { label: "Driver License No.", ctor: StringFieldModel },
        trialViolatorDriverLicenseClass: { label: "Class", ctor: StringFieldModel },
        trialViolatorCommercialDriverLicenseYes: { label: "Yes", ctor: BooleanFieldModel },
        trialViolatorCommercialDriverLicenseNo: { label: "No", ctor: BooleanFieldModel },
        trialViolatorRace: { label: "Race", ctor: StringFieldModel },
        trialViolatorSex: { label: "Sex", ctor: StringFieldModel },
        trialViolatorDateOfBirth: { label: "Date of Birth", ctor: StringFieldModel },
        trialViolatorHeight: { label: "Height", ctor: StringFieldModel },
        trialViolatorWeight: { label: "Weight", ctor: NumberFieldModel },
        trialViolatorHairColor: { label: "Hair Color", ctor: StringFieldModel },
        trialViolatorEyeColor: { label: "Eye Color", ctor: StringFieldModel }
    });

    readonly trialVehicleSection: SectionDefinition<TrialVehicleSectionModel> = DefinitionFactory.section<TrialVehicleSectionModel>("trial-vehicle-section", this.trialPage, TrialVehicleSectionModel, { isShared: true });
    readonly trialVehicleFields = defineFields(this.trialVehicleSection, {
        trialVehicleLicenseNumber: { label: "License Number", ctor: StringFieldModel },
        trialVehicleLicenseState: { label: "License State", ctor: StringFieldModel },
        trialVehicleMake: { label: "Make", ctor: StringFieldModel },
        trialVehicleYear: { label: "Year", ctor: NumberFieldModel },
        trialVehicleAuto: { label: "Auto", ctor: BooleanFieldModel },
        trialVehicleBicycle: { label: "Bicycle", ctor: BooleanFieldModel },
        trialVehicleCombination: { label: "Comb.", ctor: BooleanFieldModel },
        trialVehicleCommercialVehicle: { label: "Comm. Veh.", ctor: BooleanFieldModel },
        trialVehicleHazardousMaterials: { label: "Haz. Mt.", ctor: BooleanFieldModel },
        trialVehicleMoped: { label: "Moped", ctor: BooleanFieldModel },
        trialVehicleMotorcycle: { label: "Mtrcycl.", ctor: BooleanFieldModel },
        trialVehiclePedestrian: { label: "Pedestrian", ctor: BooleanFieldModel },
        trialVehicleOther: { label: "Other", ctor: BooleanFieldModel }
    });

    readonly trialOwnerSection: SectionDefinition<TrialOwnerSectionModel> = DefinitionFactory.section<TrialOwnerSectionModel>("trial-owner-section", this.trialPage, TrialOwnerSectionModel, { isShared: true });
    readonly trialOwnerFields = defineFields(this.trialOwnerSection, {
        trialOwnerFirstName: { label: "First Name", ctor: StringFieldModel },
        trialOwnerMiddleName: { label: "Middle Name", ctor: StringFieldModel },
        trialOwnerLastName: { label: "Last Name", ctor: StringFieldModel },
        trialOwnerStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        trialOwnerCity: { label: "City", ctor: StringFieldModel },
        trialOwnerState: { label: "State", ctor: StringFieldModel },
        trialOwnerZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly trialCourtSection: SectionDefinition<TrialCourtSectionModel> = DefinitionFactory.section<TrialCourtSectionModel>("trial-court-section", this.trialPage, TrialCourtSectionModel, { isShared: true });
    readonly trialCourtFields = defineFields(this.trialCourtSection, {
        trialCourtName: { label: "Name of Trial Court", ctor: StringFieldModel },
        trialCourtStreetAddress: { label: "Street Address", ctor: StringFieldModel },
        trialCourtDateOfTrial: { label: "Date of Trial", ctor: StringFieldModel },
        trialCourtTimeOfTrial: { label: "Time of Trial", ctor: StringFieldModel },
        trialCourtCity: { label: "City", ctor: StringFieldModel },
        trialCourtState: { label: "State", ctor: StringFieldModel },
        trialCourtZipCode: { label: "Zip Code", ctor: StringFieldModel }
    });

    readonly trialViolationSection: SectionDefinition<TrialViolationSectionModel> = DefinitionFactory.section<TrialViolationSectionModel>("trial-violation-section", this.trialPage, TrialViolationSectionModel);
    readonly trialViolationFields = defineFields(this.trialViolationSection, {
        trialViolationSectionNumber: { label: "Violation Section No.", ctor: StringFieldModel },
        trialViolationDescription: { label: "Violation - Court Appearance Required", ctor: StringFieldModel },
        trialViolationCourtAppearanceRequiredYes: { label: "Yes", ctor: BooleanFieldModel },
        trialViolationCourtAppearanceRequiredNo: { label: "No", ctor: BooleanFieldModel },
        trialViolationDateOfViolation: { label: "Date of Violation", ctor: StringFieldModel },
        trialViolationTimeOfViolation: { label: "Time of Viol.", ctor: StringFieldModel },
        trialViolationScPoints: { label: "SC Points", ctor: NumberFieldModel },
        trialViolationBloodAlcoholLevel: { label: "Blood Alcohol Level", ctor: StringFieldModel },
        trialViolationSpeed: { label: "Speed", ctor: NumberFieldModel },
        trialViolationSpeedLimit: { label: "Limit", ctor: NumberFieldModel }
    });

    readonly trialViolationLocationSection: SectionDefinition<TrialViolationLocationSectionModel> = DefinitionFactory.section<TrialViolationLocationSectionModel>("trial-violation-location-section", this.trialPage, TrialViolationLocationSectionModel, { isShared: true });
    readonly trialViolationLocationFields = defineFields(this.trialViolationLocationSection, {
        trialViolationLocation: { label: "Violation Location", ctor: StringFieldModel },
        trialViolationLocationCounty: { label: "County", ctor: StringFieldModel },
        trialViolationLocationLatitude: { label: "Latitude", ctor: StringFieldModel },
        trialViolationLocationLongitude: { label: "Longitude", ctor: StringFieldModel },
        trialViolationLocationCity: { label: "City", ctor: StringFieldModel }
    });

    readonly trialArrestingOfficerSection: SectionDefinition<TrialArrestingOfficerSectionModel> = DefinitionFactory.section<TrialArrestingOfficerSectionModel>("trial-arresting-officer-section", this.trialPage, TrialArrestingOfficerSectionModel, { isShared: true });
    readonly trialArrestingOfficerFields = defineFields(this.trialArrestingOfficerSection, {
        trialArrestingOfficerName: { label: "Name and Rank of Arresting Officer", ctor: StringFieldModel },
        trialArrestingOfficerRank: { label: "Rank", ctor: StringFieldModel },
        trialArrestingOfficerSccjaOfficerNumber: { label: "SCCJA Officer Number", ctor: StringFieldModel },
        trialArrestingOfficerBailDeposited: { label: "Bail Deposited", ctor: StringFieldModel },
        trialArrestingOfficerDateOfArrest: { label: "Date of Arrest", ctor: StringFieldModel },
        trialArrestingOfficerBondAmountRequested: { label: "Bond Amount Requested", ctor: StringFieldModel },
        trialArrestingOfficerDateBailReceived: { label: "Date Bail Rec'd", ctor: StringFieldModel },
        trialArrestingOfficerBailReceivedBy: { label: "By", ctor: StringFieldModel }
    });

    readonly trialCourtInformationSection: SectionDefinition<TrialCourtInformationSectionModel> = DefinitionFactory.section<TrialCourtInformationSectionModel>("trial-court-information-section", this.trialPage, TrialCourtInformationSectionModel, { isShared: true });
    readonly trialCourtInformationFields = defineFields(this.trialCourtInformationSection, {
        trialCourtInformationCaseBeforeMagistrate: { label: "Magistrate", ctor: BooleanFieldModel },
        trialCourtInformationCaseBeforeMunicipalCourt: { label: "Mun. Court", ctor: BooleanFieldModel },
        trialCourtInformationCaseBeforeCircuitCourt: { label: "Circuit Court", ctor: BooleanFieldModel },
        trialCourtInformationCaseBeforeFamilyCourt: { label: "Family Court", ctor: BooleanFieldModel },
        trialCourtInformationCaseBeforeFederalCourt: { label: "Federal Court", ctor: BooleanFieldModel },
        trialCourtInformationCourtIfDifferent: { label: "Name of the Trial Court if Different from Above", ctor: StringFieldModel },
        trialCourtInformationTrialByJudge: { label: "Trial Judge", ctor: BooleanFieldModel },
        trialCourtInformationTrialByJury: { label: "Jury", ctor: BooleanFieldModel },
        trialCourtInformationDefendantDidNotAppear: { label: "Did Not Appear", ctor: BooleanFieldModel },
        trialCourtInformationDefendantAppeared: { label: "Appeared", ctor: BooleanFieldModel },
        trialCourtInformationDispositionDate: { label: "Disposition Date", ctor: StringFieldModel },
        trialCourtInformationNolleProssed: { label: "Nolle Prossed", ctor: BooleanFieldModel },
        trialCourtInformationGuilty: { label: "Guilty", ctor: BooleanFieldModel },
        trialCourtInformationForfeitedBond: { label: "Forfeited Bond", ctor: BooleanFieldModel },
        trialCourtInformationNotGuilty: { label: "Not Guilty", ctor: BooleanFieldModel },
        trialCourtInformationPledNoloContendere: { label: "Pled Nolo Contendere", ctor: BooleanFieldModel },
        trialCourtInformationDeterminedBac: { label: "Determined BAC", ctor: BooleanFieldModel },
        trialCourtInformationChargeConvictedOf: { label: "Charge Convicted Of", ctor: StringFieldModel },
        trialCourtInformationSameAsOriginal: { label: "Same as Original", ctor: BooleanFieldModel },
        trialCourtInformationScPoints: { label: "SC Points", ctor: NumberFieldModel },
        trialCourtInformationJail: { label: "Jail", ctor: StringFieldModel },
        trialCourtInformationSuspend: { label: "Suspend", ctor: StringFieldModel },
        trialCourtInformationFine: { label: "Fine", ctor: StringFieldModel },
        trialCourtInformationAmountCollected: { label: "Amt. Collected", ctor: StringFieldModel },
        trialCourtInformationAmountSuspended: { label: "Amt. Suspended", ctor: StringFieldModel },
        trialCourtInformationCommittedTo: { label: "Committed To", ctor: StringFieldModel },
        trialCourtInformationVehicleSearched: { label: "Vehicle Searched", ctor: BooleanFieldModel },
        trialCourtInformationCertifiedCorrect: { label: "Certified Correct", ctor: StringFieldModel },
        trialCourtInformationCertifiedDate: { label: "Date", ctor: StringFieldModel },
        trialCourtInformationArrestResultOfCollision: { label: "Arrest as Result of Collision", ctor: BooleanFieldModel }
    });

    readonly trialFooterSection: SectionDefinition<TrialFooterSectionModel> = DefinitionFactory.section<TrialFooterSectionModel>("trial-footer-section", this.trialPage, TrialFooterSectionModel, { isShared: true });
    readonly trialFooterFields = defineFields(this.trialFooterSection, {
        trialFooterTicketNumber: { label: "Ticket #", ctor: StringFieldModel }
    });

    // declared after the front and trial pages, so whichever of them the citation is on comes before it
    readonly noticePage: PageDefinition<NoticePageModel> = DefinitionFactory.page<NoticePageModel>("notice-page", this.formDefinition, NoticePageModel);

    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
