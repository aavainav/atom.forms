import {
    defineFields,
    ISchema,
    BooleanFieldModel,
    DefinitionFactory,
    FieldDefinition,
    FormDefinition,
    NumberFieldModel,
    OptionFieldModel,
    PageDefinition,
    RuleCollection,
    Schema,
    SectionDefinition,
    StringFieldModel
} from "@forms/core";
import { createRuleCollection } from "./public-contact-or-warning-rules";
import { PublicContactOrWarningFormModel } from "./public-contact-or-warning-form";
import { RecordPageModel } from "./record-page/record-page";
import { AgencySectionModel } from "./record-page/agency-section";
import { PersonSectionModel } from "./record-page/person-section";
import { RouteSectionModel } from "./record-page/route-section";
import { StopSectionModel } from "./record-page/stop-section";
import { VehicleSectionModel } from "./record-page/vehicle-section";
import { OfficerSectionModel } from "./record-page/officer-section";
import { NatureOfContactSectionModel } from "./record-page/nature-of-contact-section";
import { PrimaryReasonSectionModel } from "./record-page/primary-reason-section";
import { SearchesSectionModel } from "./record-page/searches-section";

export interface IPublicContactOrWarningFormSchema extends ISchema {
    readonly recordPage: PageDefinition<RecordPageModel>;

    readonly agencySection: SectionDefinition<AgencySectionModel>;
    readonly agencyFields: {
        readonly agencyName: FieldDefinition<StringFieldModel>;
        readonly agencyCity: FieldDefinition<StringFieldModel>;
        readonly agencyCounty: FieldDefinition<OptionFieldModel>;
    };

    readonly personSection: SectionDefinition<PersonSectionModel>;
    readonly personFields: {
        readonly personFirstName: FieldDefinition<StringFieldModel>;
        readonly personMiddleInitial: FieldDefinition<StringFieldModel>;
        readonly personLastName: FieldDefinition<StringFieldModel>;
        readonly personLicensedState: FieldDefinition<OptionFieldModel>;
        readonly personDriverLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly personRace: FieldDefinition<OptionFieldModel>;
        readonly personGender: FieldDefinition<OptionFieldModel>;
        readonly personDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly personLatitude: FieldDefinition<StringFieldModel>;
        readonly personLongitude: FieldDefinition<StringFieldModel>;
    };

    readonly routeSection: SectionDefinition<RouteSectionModel>;
    readonly routeFields: {
        readonly routeType: FieldDefinition<StringFieldModel>;
        readonly routeNumberOrName: FieldDefinition<StringFieldModel>;
    };

    readonly stopSection: SectionDefinition<StopSectionModel>;
    readonly stopFields: {
        readonly stopCounty: FieldDefinition<OptionFieldModel>;
        readonly stopDate: FieldDefinition<StringFieldModel>;
        readonly stopTime: FieldDefinition<StringFieldModel>;
        readonly stopCadCallNumber: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleState: FieldDefinition<OptionFieldModel>;
        readonly vehicleMake: FieldDefinition<OptionFieldModel>;
        readonly vehicleModel: FieldDefinition<OptionFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
        readonly vehicleCmv: FieldDefinition<BooleanFieldModel>;
    };

    readonly officerSection: SectionDefinition<OfficerSectionModel>;
    readonly officerFields: {
        readonly officerIssuedBy: FieldDefinition<StringFieldModel>;
        readonly officerRank: FieldDefinition<StringFieldModel>;
        readonly officerScCjaNumber: FieldDefinition<StringFieldModel>;
    };

    readonly natureOfContactSection: SectionDefinition<NatureOfContactSectionModel>;
    readonly natureOfContactFields: {
        readonly natureSpeeding: FieldDefinition<BooleanFieldModel>;
        readonly natureContactOnly: FieldDefinition<BooleanFieldModel>;
        readonly natureImproperLaneUse: FieldDefinition<BooleanFieldModel>;
        readonly natureFailureToDimLights: FieldDefinition<BooleanFieldModel>;
        readonly natureImproperBacking: FieldDefinition<BooleanFieldModel>;
        readonly natureImproperLights: FieldDefinition<BooleanFieldModel>;
        readonly natureImproperTurn: FieldDefinition<BooleanFieldModel>;
        readonly natureDisregardingStopSign: FieldDefinition<BooleanFieldModel>;
        readonly natureSeatBeltViolation: FieldDefinition<BooleanFieldModel>;
        readonly natureHandsFreeViolation: FieldDefinition<BooleanFieldModel>;
        readonly natureDisregardingTrafficSignal: FieldDefinition<BooleanFieldModel>;
        readonly natureFollowingTooClose: FieldDefinition<BooleanFieldModel>;
        readonly natureChangingLanesUnlawfully: FieldDefinition<BooleanFieldModel>;
        readonly natureNoRightOfWay: FieldDefinition<BooleanFieldModel>;
        readonly natureDefectiveEquipment: FieldDefinition<BooleanFieldModel>;
        readonly natureImproperPassing: FieldDefinition<BooleanFieldModel>;
        readonly natureDriversLicenseViolation: FieldDefinition<BooleanFieldModel>;
        readonly natureVehicleLicenseViolation: FieldDefinition<BooleanFieldModel>;
        readonly naturePedestrian: FieldDefinition<BooleanFieldModel>;
        readonly natureImmigrationStop: FieldDefinition<BooleanFieldModel>;
        readonly natureOther: FieldDefinition<BooleanFieldModel>;
        readonly natureOtherSpecify: FieldDefinition<StringFieldModel>;
    };

    readonly primaryReasonSection: SectionDefinition<PrimaryReasonSectionModel>;
    readonly primaryReasonFields: {
        readonly primaryReasonMovingViolation: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonNonMovingViolation: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonMotoristAssistance: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonBolo: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonTrafficCollision: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonSuspiciousActivity: FieldDefinition<BooleanFieldModel>;
        readonly primaryReasonOtherSpecify: FieldDefinition<StringFieldModel>;
    };

    readonly searchesSection: SectionDefinition<SearchesSectionModel>;
    readonly searchesFields: {
        readonly searchesOfDriver: FieldDefinition<BooleanFieldModel>;
        readonly searchesOfPedestrian: FieldDefinition<BooleanFieldModel>;
        readonly searchesOfVehicle: FieldDefinition<BooleanFieldModel>;
        readonly searchesOfPassenger: FieldDefinition<BooleanFieldModel>;
        readonly searchesConsentRequestedYes: FieldDefinition<BooleanFieldModel>;
        readonly searchesConsentRequestedNo: FieldDefinition<BooleanFieldModel>;
        readonly searchesConsentGivenYes: FieldDefinition<BooleanFieldModel>;
        readonly searchesConsentGivenNo: FieldDefinition<BooleanFieldModel>;
        readonly searchesMadeByConsent: FieldDefinition<BooleanFieldModel>;
        readonly searchesIncidentToArrest: FieldDefinition<BooleanFieldModel>;
        readonly searchesInventoryVehicleTowed: FieldDefinition<BooleanFieldModel>;
        readonly searchesProbableCause: FieldDefinition<BooleanFieldModel>;
        readonly searchesBasisOtherSpecify: FieldDefinition<StringFieldModel>;
    };

    readonly ruleCollection: RuleCollection;
}

/** Represents the schema definition for the SC Form 432 (Public Contact / Warning) form, defining its pages, sections, and fields. */
export class PublicContactOrWarningFormSchema extends Schema implements IPublicContactOrWarningFormSchema {
    readonly formDefinition: FormDefinition<PublicContactOrWarningFormModel> = DefinitionFactory.form<PublicContactOrWarningFormModel>("public-contact-or-warning-form", PublicContactOrWarningFormModel);

    readonly recordPage: PageDefinition<RecordPageModel> = DefinitionFactory.page<RecordPageModel>("record-page", this.formDefinition, RecordPageModel);

    readonly agencySection: SectionDefinition<AgencySectionModel> = DefinitionFactory.section<AgencySectionModel>("agency-section", this.recordPage, AgencySectionModel);
    readonly agencyFields = defineFields(this.agencySection, {
        agencyName: { label: "Agency Name", ctor: StringFieldModel },
        agencyCity: { label: "City", ctor: StringFieldModel },
        agencyCounty: { label: "County Of", ctor: OptionFieldModel }
    });

    readonly personSection: SectionDefinition<PersonSectionModel> = DefinitionFactory.section<PersonSectionModel>("person-section", this.recordPage, PersonSectionModel);
    readonly personFields = defineFields(this.personSection, {
        personFirstName: { label: "First Name", ctor: StringFieldModel },
        personMiddleInitial: { label: "M.I.", ctor: StringFieldModel },
        personLastName: { label: "Last Name", ctor: StringFieldModel },
        personLicensedState: { label: "ST. Licensed", ctor: OptionFieldModel },
        personDriverLicenseNumber: { label: "Driver's License No.", ctor: StringFieldModel },
        personRace: { label: "Race / Ethn.", ctor: OptionFieldModel },
        personGender: { label: "Gender", ctor: OptionFieldModel },
        personDateOfBirth: { label: "Date of Birth", ctor: StringFieldModel },
        // The latitude/longitude labels need to stay blank since the form label component will handle displaying it.
        personLatitude: { label: "", ctor: StringFieldModel },
        personLongitude: { label: "", ctor: StringFieldModel }
    });

    readonly routeSection: SectionDefinition<RouteSectionModel> = DefinitionFactory.section<RouteSectionModel>("route-section", this.recordPage, RouteSectionModel);
    readonly routeFields = defineFields(this.routeSection, {
        routeType: { label: "RT. Type", ctor: StringFieldModel },
        routeNumberOrName: { label: "RT. # / Name", ctor: StringFieldModel }
    });

    readonly stopSection: SectionDefinition<StopSectionModel> = DefinitionFactory.section<StopSectionModel>("stop-section", this.recordPage, StopSectionModel);
    readonly stopFields = defineFields(this.stopSection, {
        stopCounty: { label: "CTY", ctor: OptionFieldModel },
        stopDate: { label: "Date", ctor: StringFieldModel },
        stopTime: { label: "Time", ctor: StringFieldModel },
        stopCadCallNumber: { label: "CAD Call Number", ctor: StringFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.recordPage, VehicleSectionModel);
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleLicenseNumber: { label: "Veh. License No.", ctor: StringFieldModel },
        vehicleState: { label: "State", ctor: OptionFieldModel },
        vehicleMake: { label: "Veh. Make", ctor: OptionFieldModel },
        vehicleModel: { label: "Veh. Model", ctor: OptionFieldModel },
        vehicleYear: { label: "Year", ctor: NumberFieldModel },
        vehicleCmv: { label: "CMV", ctor: BooleanFieldModel }
    });

    readonly officerSection: SectionDefinition<OfficerSectionModel> = DefinitionFactory.section<OfficerSectionModel>("officer-section", this.recordPage, OfficerSectionModel);
    readonly officerFields = defineFields(this.officerSection, {
        officerIssuedBy: { label: "Issued By", ctor: StringFieldModel },
        officerRank: { label: "Rank", ctor: StringFieldModel },
        officerScCjaNumber: { label: "SC CJA #", ctor: StringFieldModel }
    });

    readonly natureOfContactSection: SectionDefinition<NatureOfContactSectionModel> = DefinitionFactory.section<NatureOfContactSectionModel>("nature-of-contact-section", this.recordPage, NatureOfContactSectionModel);
    readonly natureOfContactFields = defineFields(this.natureOfContactSection, {
        natureSpeeding: { label: "Speeding", ctor: BooleanFieldModel },
        natureContactOnly: { label: "Contact Only", ctor: BooleanFieldModel },
        natureImproperLaneUse: { label: "Improper Lane Use", ctor: BooleanFieldModel },
        natureFailureToDimLights: { label: "Failure to Dim Lights", ctor: BooleanFieldModel },
        natureImproperBacking: { label: "Improper Backing", ctor: BooleanFieldModel },
        natureImproperLights: { label: "Improper Lights", ctor: BooleanFieldModel },
        natureImproperTurn: { label: "Improper Turn", ctor: BooleanFieldModel },
        natureDisregardingStopSign: { label: "Disregarding Stop Sign", ctor: BooleanFieldModel },
        natureSeatBeltViolation: { label: "Seat Belt Violation", ctor: BooleanFieldModel },
        natureHandsFreeViolation: { label: "Hands Free Violation", ctor: BooleanFieldModel },
        natureDisregardingTrafficSignal: { label: "Disregarding Traffic Signal", ctor: BooleanFieldModel },
        natureFollowingTooClose: { label: "Following Too Close", ctor: BooleanFieldModel },
        natureChangingLanesUnlawfully: { label: "Changing Lanes Unlawfully", ctor: BooleanFieldModel },
        natureNoRightOfWay: { label: "No Right of Way", ctor: BooleanFieldModel },
        natureDefectiveEquipment: { label: "Defective Equipment", ctor: BooleanFieldModel },
        natureImproperPassing: { label: "Improper Passing", ctor: BooleanFieldModel },
        natureDriversLicenseViolation: { label: "Drivers License Violation", ctor: BooleanFieldModel },
        natureVehicleLicenseViolation: { label: "Vehicle License Violation", ctor: BooleanFieldModel },
        naturePedestrian: { label: "Pedestrian", ctor: BooleanFieldModel },
        natureImmigrationStop: { label: "Immigration Stop", ctor: BooleanFieldModel },
        natureOther: { label: "Other (Specify)", ctor: BooleanFieldModel },
        natureOtherSpecify: { label: "", ctor: StringFieldModel }
    });

    readonly primaryReasonSection: SectionDefinition<PrimaryReasonSectionModel> = DefinitionFactory.section<PrimaryReasonSectionModel>("primary-reason-section", this.recordPage, PrimaryReasonSectionModel);
    readonly primaryReasonFields = defineFields(this.primaryReasonSection, {
        primaryReasonMovingViolation: { label: "Moving Violation", ctor: BooleanFieldModel },
        primaryReasonNonMovingViolation: { label: "Non-Moving Violation", ctor: BooleanFieldModel },
        primaryReasonMotoristAssistance: { label: "Motorist Assistance", ctor: BooleanFieldModel },
        primaryReasonBolo: { label: "BOLO", ctor: BooleanFieldModel },
        primaryReasonTrafficCollision: { label: "Traffic Collision", ctor: BooleanFieldModel },
        primaryReasonSuspiciousActivity: { label: "Suspicious Activity", ctor: BooleanFieldModel },
        primaryReasonOther: { label: "Other (Specify)", ctor: BooleanFieldModel },
        primaryReasonOtherSpecify: { label: "", ctor: StringFieldModel }
    });

    readonly searchesSection: SectionDefinition<SearchesSectionModel> = DefinitionFactory.section<SearchesSectionModel>("searches-section", this.recordPage, SearchesSectionModel);
    readonly searchesFields = defineFields(this.searchesSection, {
        searchesOfDriver: { label: "Of Driver", ctor: BooleanFieldModel },
        searchesOfPedestrian: { label: "Of Pedestrian", ctor: BooleanFieldModel },
        searchesOfVehicle: { label: "Of Vehicle", ctor: BooleanFieldModel },
        searchesOfPassenger: { label: "Of Passenger", ctor: BooleanFieldModel },
        searchesConsentRequestedYes: { label: "Yes", ctor: BooleanFieldModel },
        searchesConsentRequestedNo: { label: "No", ctor: BooleanFieldModel },
        searchesConsentGivenYes: { label: "Yes", ctor: BooleanFieldModel },
        searchesConsentGivenNo: { label: "No", ctor: BooleanFieldModel },
        searchesMadeByConsent: { label: "Search Made By Consent", ctor: BooleanFieldModel },
        searchesIncidentToArrest: { label: "Incident to Arrest", ctor: BooleanFieldModel },
        searchesInventoryVehicleTowed: { label: "Inventory (Vehicle Towed)", ctor: BooleanFieldModel },
        searchesProbableCause: { label: "Probable Cause", ctor: BooleanFieldModel },
        searchesBasisOther: { label: "Other (Specify)", ctor: BooleanFieldModel },
        searchesBasisOtherSpecify: { label: "", ctor: StringFieldModel }
    });

    // declared last so that every field group above is initialized before the rules referencing them are built.
    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
