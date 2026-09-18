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

import { createRuleCollection } from "./utc-rules";
import { GAUTCFormModel } from "./utc-form";
import { CitationPageModel } from "./citation-page/citation-page";
import { CertificationSectionModel } from "./citation-page/certification-section";
import { ConditionsSectionModel } from "./citation-page/conditions-section";
import { DuiSectionModel } from "./citation-page/dui-section";
import { HeaderSectionModel } from "./citation-page/header-section";
import { LocationSectionModel } from "./citation-page/location-section";
import { OffenseSectionModel } from "./citation-page/offense-section";
import { OfficerSectionModel } from "./citation-page/officer-section";
import { StatusSectionModel } from "./citation-page/status-section";
import { SummonsSectionModel } from "./citation-page/summons-section";
import { VehicleSectionModel } from "./citation-page/vehicle-section";
import { ViolationSectionModel } from "./citation-page/violation-section";
import { ViolatorSectionModel } from "./citation-page/violator-section";
import { CourtPageModel } from "./court-page/court-page";
import { CourtActionSectionModel } from "./court-page/court-action-section";
import { DispositionSectionModel } from "./court-page/disposition-section";
import { JudgmentSectionModel } from "./court-page/judgment-section";
import { PleaSectionModel } from "./court-page/plea-section";

export interface IGAUTCFormSchema extends ISchema {
    readonly citationPage: PageDefinition<CitationPageModel>;

    readonly headerSection: SectionDefinition<HeaderSectionModel>;
    readonly headerFields: {
        readonly headerAm: FieldDefinition<BooleanFieldModel>;
        readonly headerCicaNumber: FieldDefinition<StringFieldModel>;
        readonly headerCitationNumber: FieldDefinition<StringFieldModel>;
        readonly headerDay: FieldDefinition<StringFieldModel>;
        readonly headerHour: FieldDefinition<StringFieldModel>;
        readonly headerMinute: FieldDefinition<StringFieldModel>;
        readonly headerMonth: FieldDefinition<StringFieldModel>;
        readonly headerNcicNumber: FieldDefinition<StringFieldModel>;
        readonly headerPm: FieldDefinition<BooleanFieldModel>;
        readonly headerYear: FieldDefinition<StringFieldModel>;
    };

    readonly violatorSection: SectionDefinition<ViolatorSectionModel>;
    readonly violatorFields: {
        readonly violatorAddress: FieldDefinition<StringFieldModel>;
        readonly violatorApartment: FieldDefinition<StringFieldModel>;
        readonly violatorCity: FieldDefinition<StringFieldModel>;
        readonly violatorDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly violatorEye: FieldDefinition<StringFieldModel>;
        readonly violatorFirstName: FieldDefinition<StringFieldModel>;
        readonly violatorHair: FieldDefinition<StringFieldModel>;
        readonly violatorHeight: FieldDefinition<StringFieldModel>;
        readonly violatorLastName: FieldDefinition<StringFieldModel>;
        readonly violatorLicenseClass: FieldDefinition<StringFieldModel>;
        readonly violatorLicenseEndorsements: FieldDefinition<StringFieldModel>;
        readonly violatorLicenseExpires: FieldDefinition<StringFieldModel>;
        readonly violatorLicenseState: FieldDefinition<OptionFieldModel>;
        readonly violatorMiddleName: FieldDefinition<StringFieldModel>;
        readonly violatorOperatorLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly violatorPhone: FieldDefinition<StringFieldModel>;
        readonly violatorRace: FieldDefinition<StringFieldModel>;
        readonly violatorSex: FieldDefinition<OptionFieldModel>;
        readonly violatorState: FieldDefinition<OptionFieldModel>;
        readonly violatorSuffix: FieldDefinition<StringFieldModel>;
        readonly violatorWeight: FieldDefinition<NumberFieldModel>;
        readonly violatorZipCode: FieldDefinition<StringFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleColor: FieldDefinition<StringFieldModel>;
        readonly vehicleMake: FieldDefinition<OptionFieldModel>;
        readonly vehicleModel: FieldDefinition<OptionFieldModel>;
        readonly vehicleRegistrationNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleRegistrationState: FieldDefinition<OptionFieldModel>;
        readonly vehicleRegistrationYear: FieldDefinition<StringFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
    };

    readonly statusSection: SectionDefinition<StatusSectionModel>;
    readonly statusFields: {
        readonly statusAccidentNo: FieldDefinition<BooleanFieldModel>;
        readonly statusAccidentYes: FieldDefinition<BooleanFieldModel>;
        readonly statusCdlNo: FieldDefinition<BooleanFieldModel>;
        readonly statusCdlYes: FieldDefinition<BooleanFieldModel>;
        readonly statusFatalitiesNo: FieldDefinition<BooleanFieldModel>;
        readonly statusFatalitiesYes: FieldDefinition<BooleanFieldModel>;
        readonly statusInjuriesNo: FieldDefinition<BooleanFieldModel>;
        readonly statusInjuriesYes: FieldDefinition<BooleanFieldModel>;
    };

    readonly violationSection: SectionDefinition<ViolationSectionModel>;
    readonly violationFields: {
        readonly violationCalibrationCheck: FieldDefinition<StringFieldModel>;
        readonly violationClockedByOther: FieldDefinition<BooleanFieldModel>;
        readonly violationClockedByPatrolVehicle: FieldDefinition<BooleanFieldModel>;
        readonly violationClockedSpeed: FieldDefinition<NumberFieldModel>;
        readonly violationDriverRequestedAccuracyCheck: FieldDefinition<BooleanFieldModel>;
        readonly violationLaser: FieldDefinition<BooleanFieldModel>;
        readonly violationRadar: FieldDefinition<BooleanFieldModel>;
        readonly violationSerialNumber: FieldDefinition<StringFieldModel>;
        readonly violationSpeedZone: FieldDefinition<NumberFieldModel>;
        readonly violationTwoLaneRoad: FieldDefinition<BooleanFieldModel>;
        readonly violationVascar: FieldDefinition<BooleanFieldModel>;
    };

    readonly duiSection: SectionDefinition<DuiSectionModel>;
    readonly duiFields: {
        readonly duiCharged: FieldDefinition<BooleanFieldModel>;
        readonly duiTestAdministeredBy: FieldDefinition<StringFieldModel>;
        readonly duiTestBlood: FieldDefinition<BooleanFieldModel>;
        readonly duiTestBreath: FieldDefinition<BooleanFieldModel>;
        readonly duiTestOther: FieldDefinition<BooleanFieldModel>;
        readonly duiTestResults: FieldDefinition<StringFieldModel>;
        readonly duiTestUrine: FieldDefinition<BooleanFieldModel>;
    };

    readonly offenseSection: SectionDefinition<OffenseSectionModel>;
    readonly offenseFields: {
        readonly offenseCodeSection: FieldDefinition<StringFieldModel>;
        readonly offenseCompanionCaseNo: FieldDefinition<BooleanFieldModel>;
        readonly offenseCompanionCaseYes: FieldDefinition<BooleanFieldModel>;
        readonly offenseCompanionCitation: FieldDefinition<StringFieldModel>;
        readonly offenseDescription: FieldDefinition<StringFieldModel>;
        readonly offenseLocalOrdinance: FieldDefinition<BooleanFieldModel>;
        readonly offenseRemarks: FieldDefinition<StringFieldModel>;
        readonly offenseStateLaw: FieldDefinition<BooleanFieldModel>;
    };

    readonly conditionsSection: SectionDefinition<ConditionsSectionModel>;
    readonly conditionsFields: {
        readonly conditionsCommercialVehicle: FieldDefinition<BooleanFieldModel>;
        readonly conditionsHazardousMaterial: FieldDefinition<BooleanFieldModel>;
        readonly conditionsLightingDarkness: FieldDefinition<BooleanFieldModel>;
        readonly conditionsLightingDaylight: FieldDefinition<BooleanFieldModel>;
        readonly conditionsLightingOther: FieldDefinition<BooleanFieldModel>;
        readonly conditionsRoadDry: FieldDefinition<BooleanFieldModel>;
        readonly conditionsRoadIce: FieldDefinition<BooleanFieldModel>;
        readonly conditionsRoadOther: FieldDefinition<BooleanFieldModel>;
        readonly conditionsRoadWet: FieldDefinition<BooleanFieldModel>;
        readonly conditionsSixteenPlusPassengers: FieldDefinition<BooleanFieldModel>;
        readonly conditionsSurfaceBlacktop: FieldDefinition<BooleanFieldModel>;
        readonly conditionsSurfaceConcrete: FieldDefinition<BooleanFieldModel>;
        readonly conditionsSurfaceDirt: FieldDefinition<BooleanFieldModel>;
        readonly conditionsSurfaceOther: FieldDefinition<BooleanFieldModel>;
        readonly conditionsTrafficHeavy: FieldDefinition<BooleanFieldModel>;
        readonly conditionsTrafficLight: FieldDefinition<BooleanFieldModel>;
        readonly conditionsTrafficMedium: FieldDefinition<BooleanFieldModel>;
        readonly conditionsWeatherClear: FieldDefinition<BooleanFieldModel>;
        readonly conditionsWeatherCloudy: FieldDefinition<BooleanFieldModel>;
        readonly conditionsWeatherOther: FieldDefinition<BooleanFieldModel>;
        readonly conditionsWeatherRaining: FieldDefinition<BooleanFieldModel>;
    };

    readonly locationSection: SectionDefinition<LocationSectionModel>;
    readonly locationFields: {
        readonly locationCity: FieldDefinition<StringFieldModel>;
        readonly locationCounty: FieldDefinition<OptionFieldModel>;
        readonly locationStreet: FieldDefinition<StringFieldModel>;
    };

    readonly officerSection: SectionDefinition<OfficerSectionModel>;
    readonly officerFields: {
        readonly officerApdIdNumber: FieldDefinition<StringFieldModel>;
        readonly officerAssignment: FieldDefinition<StringFieldModel>;
        readonly officerCourtCode: FieldDefinition<StringFieldModel>;
        readonly officerName: FieldDefinition<StringFieldModel>;
        readonly officerOffDays: FieldDefinition<StringFieldModel>;
        readonly officerSecondApdIdNumber: FieldDefinition<StringFieldModel>;
        readonly officerSecondAssignment: FieldDefinition<StringFieldModel>;
        readonly officerSecondCourtCode: FieldDefinition<StringFieldModel>;
        readonly officerSecondName: FieldDefinition<StringFieldModel>;
        readonly officerSecondOffDays: FieldDefinition<StringFieldModel>;
        readonly officerSecondTime: FieldDefinition<StringFieldModel>;
        readonly officerTime: FieldDefinition<StringFieldModel>;
    };

    readonly summonsSection: SectionDefinition<SummonsSectionModel>;
    readonly summonsFields: {
        readonly summonsAm: FieldDefinition<BooleanFieldModel>;
        readonly summonsAppearanceDay: FieldDefinition<StringFieldModel>;
        readonly summonsAppearanceMonth: FieldDefinition<StringFieldModel>;
        readonly summonsAppearanceYear: FieldDefinition<StringFieldModel>;
        readonly summonsCity: FieldDefinition<StringFieldModel>;
        readonly summonsCopy: FieldDefinition<BooleanFieldModel>;
        readonly summonsCourtName: FieldDefinition<StringFieldModel>;
        readonly summonsHour: FieldDefinition<StringFieldModel>;
        readonly summonsJail: FieldDefinition<BooleanFieldModel>;
        readonly summonsLicenseDisplayedNo: FieldDefinition<BooleanFieldModel>;
        readonly summonsLicenseDisplayedYes: FieldDefinition<BooleanFieldModel>;
        readonly summonsMinute: FieldDefinition<StringFieldModel>;
        readonly summonsPm: FieldDefinition<BooleanFieldModel>;
        readonly summonsReleaseTo: FieldDefinition<StringFieldModel>;
        readonly summonsSignature: FieldDefinition<StringFieldModel>;
    };

    readonly certificationSection: SectionDefinition<CertificationSectionModel>;
    readonly certificationFields: {
        readonly certificationOfficerSignature: FieldDefinition<StringFieldModel>;
        readonly certificationSignatureAndTitle: FieldDefinition<StringFieldModel>;
        readonly certificationSwornDay: FieldDefinition<StringFieldModel>;
        readonly certificationSwornMonth: FieldDefinition<StringFieldModel>;
        readonly certificationSwornYear: FieldDefinition<StringFieldModel>;
    };

    readonly courtPage: PageDefinition<CourtPageModel>;

    readonly courtActionSection: SectionDefinition<CourtActionSectionModel>;
    readonly courtActionFields: {
        readonly courtActionArraignmentPlea: FieldDefinition<StringFieldModel>;
        readonly courtActionBailFixed: FieldDefinition<StringFieldModel>;
        readonly courtActionBailGivenBySignature: FieldDefinition<StringFieldModel>;
        readonly courtActionBailTakenBySignature: FieldDefinition<StringFieldModel>;
        readonly courtActionCashDeposit: FieldDefinition<StringFieldModel>;
        readonly courtActionClerkSignature: FieldDefinition<StringFieldModel>;
        readonly courtActionComplaintFiled: FieldDefinition<StringFieldModel>;
        readonly courtActionDate: FieldDefinition<StringFieldModel>;
        readonly courtActionFineAmount: FieldDefinition<StringFieldModel>;
        readonly courtActionFirstContinuance: FieldDefinition<StringFieldModel>;
        readonly courtActionFirstContinuanceReason: FieldDefinition<StringFieldModel>;
        readonly courtActionSecondContinuance: FieldDefinition<StringFieldModel>;
        readonly courtActionSecondContinuanceReason: FieldDefinition<StringFieldModel>;
        readonly courtActionWaivesTrialByJury: FieldDefinition<StringFieldModel>;
        readonly courtActionWarrantIssued: FieldDefinition<StringFieldModel>;
        readonly courtActionWarrantServed: FieldDefinition<StringFieldModel>;
    };

    readonly pleaSection: SectionDefinition<PleaSectionModel>;
    readonly pleaFields: {
        readonly pleaAccusedName: FieldDefinition<StringFieldModel>;
        readonly pleaAccusedSignature: FieldDefinition<StringFieldModel>;
        readonly pleaChargedWith: FieldDefinition<StringFieldModel>;
        readonly pleaDay: FieldDefinition<StringFieldModel>;
        readonly pleaJudgeName: FieldDefinition<StringFieldModel>;
        readonly pleaJudgeSignature: FieldDefinition<StringFieldModel>;
        readonly pleaMaximumFine: FieldDefinition<StringFieldModel>;
        readonly pleaMaximumMonths: FieldDefinition<StringFieldModel>;
        readonly pleaMinimumFine: FieldDefinition<StringFieldModel>;
        readonly pleaMinimumMonths: FieldDefinition<StringFieldModel>;
        readonly pleaMonth: FieldDefinition<StringFieldModel>;
        readonly pleaYear: FieldDefinition<StringFieldModel>;
    };

    readonly dispositionSection: SectionDefinition<DispositionSectionModel>;
    readonly dispositionFields: {
        readonly dispositionAlcoholDrugAssessment: FieldDefinition<BooleanFieldModel>;
        readonly dispositionAlcoholDrugRiskReductionSchool: FieldDefinition<BooleanFieldModel>;
        readonly dispositionBondForfeiture: FieldDefinition<BooleanFieldModel>;
        readonly dispositionDaysInJail: FieldDefinition<StringFieldModel>;
        readonly dispositionDeadDocket: FieldDefinition<BooleanFieldModel>;
        readonly dispositionDefensiveDrivingSchool: FieldDefinition<BooleanFieldModel>;
        readonly dispositionFineAmount: FieldDefinition<StringFieldModel>;
        readonly dispositionNolleProssed: FieldDefinition<BooleanFieldModel>;
        readonly dispositionPleadsGuilty: FieldDefinition<BooleanFieldModel>;
        readonly dispositionPleadsNoloContendere: FieldDefinition<BooleanFieldModel>;
        readonly dispositionPleadsNotGuilty: FieldDefinition<BooleanFieldModel>;
        readonly dispositionTrialCourtAdjudicated: FieldDefinition<BooleanFieldModel>;
        readonly dispositionTrialGuilty: FieldDefinition<BooleanFieldModel>;
        readonly dispositionTrialJury: FieldDefinition<BooleanFieldModel>;
        readonly dispositionTrialNotGuilty: FieldDefinition<BooleanFieldModel>;
    };

    readonly judgmentSection: SectionDefinition<JudgmentSectionModel>;
    readonly judgmentFields: {
        readonly judgmentAppealBond: FieldDefinition<StringFieldModel>;
        readonly judgmentConfinementTerm: FieldDefinition<StringFieldModel>;
        readonly judgmentDate: FieldDefinition<StringFieldModel>;
        readonly judgmentFineAmount: FieldDefinition<StringFieldModel>;
        readonly judgmentJudgeSignature: FieldDefinition<StringFieldModel>;
    };

    readonly ruleCollection: RuleCollection;
}

/**
 * Schema for the Georgia uniform traffic citation, summons, and accusation. The citation page carries the five
 * sections the paper numbers I through V, split further where a printed section holds more than one block of
 * boxes: Section I becomes violator/vehicle/status, Section II becomes violation/DUI/offense/conditions. The
 * court page is the reverse of the court's copy.
 */
export class GAUTCFormSchema extends Schema implements IGAUTCFormSchema {
    readonly formDefinition: FormDefinition<GAUTCFormModel> = DefinitionFactory.form<GAUTCFormModel>("ga-utc-form", GAUTCFormModel, this);

    readonly citationPage: PageDefinition<CitationPageModel> = DefinitionFactory.page<CitationPageModel>("citation-page", this.formDefinition, CitationPageModel);

    readonly headerSection: SectionDefinition<HeaderSectionModel> = DefinitionFactory.section<HeaderSectionModel>("header-section", this.citationPage, HeaderSectionModel, { isShared: true });
    readonly headerFields = defineFields(this.headerSection, {
        headerCicaNumber: { label: "CICA Number", ctor: StringFieldModel },
        headerNcicNumber: { label: "NCIC Number", ctor: StringFieldModel },
        headerCitationNumber: { label: "Citation Number", ctor: StringFieldModel },
        headerMonth: { label: "On Month", ctor: StringFieldModel },
        headerDay: { label: "Day", ctor: StringFieldModel },
        headerYear: { label: "Yr.", ctor: StringFieldModel },
        headerHour: { label: "Hour", ctor: StringFieldModel },
        headerMinute: { label: "Minute", ctor: StringFieldModel },
        headerAm: { label: "AM", ctor: BooleanFieldModel },
        headerPm: { label: "PM", ctor: BooleanFieldModel }
    });

    readonly violatorSection: SectionDefinition<ViolatorSectionModel> = DefinitionFactory.section<ViolatorSectionModel>("violator-section", this.citationPage, ViolatorSectionModel, { isShared: true });
    readonly violatorFields = defineFields(this.violatorSection, {
        violatorLicenseClass: { label: "License Class or Type", ctor: StringFieldModel },
        violatorLicenseState: { label: "State", ctor: OptionFieldModel, name: "violator-license-state" },
        violatorLicenseEndorsements: { label: "Endorsements", ctor: StringFieldModel },
        violatorLicenseExpires: { label: "Expires", ctor: StringFieldModel },
        violatorOperatorLicenseNumber: { label: "Operator License No.", ctor: StringFieldModel },
        violatorLastName: { label: "Last", ctor: StringFieldModel },
        violatorSuffix: { label: "Suffix", ctor: StringFieldModel },
        violatorFirstName: { label: "First", ctor: StringFieldModel },
        violatorMiddleName: { label: "Middle", ctor: StringFieldModel },
        violatorRace: { label: "Race", ctor: StringFieldModel },
        violatorSex: { label: "Sex", ctor: OptionFieldModel },
        violatorAddress: { label: "Current Address", ctor: StringFieldModel },
        violatorApartment: { label: "Apt.", ctor: StringFieldModel },
        violatorCity: { label: "City", ctor: StringFieldModel },
        violatorState: { label: "State", ctor: OptionFieldModel, name: "violator-state" },
        violatorZipCode: { label: "Zip Code", ctor: StringFieldModel },
        violatorPhone: { label: "Phone Number", ctor: StringFieldModel },
        violatorDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        violatorHair: { label: "Hair", ctor: StringFieldModel },
        violatorHeight: { label: "Height", ctor: StringFieldModel },
        violatorWeight: { label: "Weight", ctor: NumberFieldModel },
        violatorEye: { label: "Eye", ctor: StringFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.citationPage, VehicleSectionModel, { isShared: true });
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleYear: { label: "Veh. Yr.", ctor: NumberFieldModel },
        vehicleMake: { label: "Make", ctor: OptionFieldModel },
        vehicleModel: { label: "Model", ctor: OptionFieldModel },
        vehicleColor: { label: "Color", ctor: StringFieldModel },
        vehicleRegistrationNumber: { label: "Registration No.", ctor: StringFieldModel },
        vehicleRegistrationYear: { label: "Yr.", ctor: StringFieldModel, name: "vehicle-registration-year" },
        vehicleRegistrationState: { label: "State", ctor: OptionFieldModel, name: "vehicle-registration-state" }
    });

    readonly statusSection: SectionDefinition<StatusSectionModel> = DefinitionFactory.section<StatusSectionModel>("status-section", this.citationPage, StatusSectionModel, { isShared: true });
    readonly statusFields = defineFields(this.statusSection, {
        statusCdlYes: { label: "Yes", ctor: BooleanFieldModel, name: "status-cdl-yes" },
        statusCdlNo: { label: "No", ctor: BooleanFieldModel, name: "status-cdl-no" },
        statusAccidentYes: { label: "Yes", ctor: BooleanFieldModel, name: "status-accident-yes" },
        statusAccidentNo: { label: "No", ctor: BooleanFieldModel, name: "status-accident-no" },
        statusInjuriesYes: { label: "Yes", ctor: BooleanFieldModel, name: "status-injuries-yes" },
        statusInjuriesNo: { label: "No", ctor: BooleanFieldModel, name: "status-injuries-no" },
        statusFatalitiesYes: { label: "Yes", ctor: BooleanFieldModel, name: "status-fatalities-yes" },
        statusFatalitiesNo: { label: "No", ctor: BooleanFieldModel, name: "status-fatalities-no" }
    });

    readonly violationSection: SectionDefinition<ViolationSectionModel> = DefinitionFactory.section<ViolationSectionModel>("violation-section", this.citationPage, ViolationSectionModel);
    readonly violationFields = defineFields(this.violationSection, {
        violationTwoLaneRoad: { label: "2-Lane Road", ctor: BooleanFieldModel },
        violationDriverRequestedAccuracyCheck: { label: "Driver Requested Accuracy Check", ctor: BooleanFieldModel },
        violationVascar: { label: "VASCAR", ctor: BooleanFieldModel },
        violationLaser: { label: "Laser", ctor: BooleanFieldModel },
        violationRadar: { label: "Radar", ctor: BooleanFieldModel },
        violationClockedByPatrolVehicle: { label: "Patrol Vehicle", ctor: BooleanFieldModel },
        violationClockedByOther: { label: "Other", ctor: BooleanFieldModel, name: "violation-clocked-by-other" },
        violationSerialNumber: { label: "Serial #", ctor: StringFieldModel },
        violationCalibrationCheck: { label: "Calibration/Check", ctor: StringFieldModel },
        violationClockedSpeed: { label: "MPH", ctor: NumberFieldModel },
        violationSpeedZone: { label: "Zone", ctor: NumberFieldModel }
    });

    readonly duiSection: SectionDefinition<DuiSectionModel> = DefinitionFactory.section<DuiSectionModel>("dui-section", this.citationPage, DuiSectionModel);
    readonly duiFields = defineFields(this.duiSection, {
        duiCharged: { label: "DUI", ctor: BooleanFieldModel },
        duiTestBlood: { label: "Blood", ctor: BooleanFieldModel },
        duiTestBreath: { label: "Breath", ctor: BooleanFieldModel },
        duiTestUrine: { label: "Urine", ctor: BooleanFieldModel },
        duiTestOther: { label: "Other", ctor: BooleanFieldModel, name: "dui-test-other" },
        duiTestResults: { label: "DUI Test Results", ctor: StringFieldModel },
        duiTestAdministeredBy: { label: "Test Administered By", ctor: StringFieldModel }
    });

    readonly offenseSection: SectionDefinition<OffenseSectionModel> = DefinitionFactory.section<OffenseSectionModel>("offense-section", this.citationPage, OffenseSectionModel);
    readonly offenseFields = defineFields(this.offenseSection, {
        offenseDescription: { label: "Offense (Other than above)", ctor: StringFieldModel },
        offenseCodeSection: { label: "Code Section", ctor: StringFieldModel },
        offenseStateLaw: { label: "State Law", ctor: BooleanFieldModel },
        offenseLocalOrdinance: { label: "Local Ordinance", ctor: BooleanFieldModel },
        offenseCompanionCaseYes: { label: "Yes", ctor: BooleanFieldModel, name: "offense-companion-case-yes" },
        offenseCompanionCaseNo: { label: "No", ctor: BooleanFieldModel, name: "offense-companion-case-no" },
        offenseCompanionCitation: { label: "Citation No. / Name", ctor: StringFieldModel },
        offenseRemarks: { label: "Remarks / Victim Name / #", ctor: StringFieldModel }
    });

    readonly conditionsSection: SectionDefinition<ConditionsSectionModel> = DefinitionFactory.section<ConditionsSectionModel>("conditions-section", this.citationPage, ConditionsSectionModel, { isShared: true });
    readonly conditionsFields = defineFields(this.conditionsSection, {
        conditionsWeatherClear: { label: "Clear", ctor: BooleanFieldModel },
        conditionsWeatherCloudy: { label: "Cloudy", ctor: BooleanFieldModel },
        conditionsWeatherRaining: { label: "Raining", ctor: BooleanFieldModel },
        conditionsWeatherOther: { label: "Other", ctor: BooleanFieldModel, name: "conditions-weather-other" },
        conditionsRoadDry: { label: "Dry", ctor: BooleanFieldModel },
        conditionsRoadWet: { label: "Wet", ctor: BooleanFieldModel },
        conditionsRoadIce: { label: "Ice", ctor: BooleanFieldModel },
        conditionsRoadOther: { label: "Other", ctor: BooleanFieldModel, name: "conditions-road-other" },
        conditionsSurfaceConcrete: { label: "Concrete", ctor: BooleanFieldModel },
        conditionsSurfaceBlacktop: { label: "Blacktop", ctor: BooleanFieldModel },
        conditionsSurfaceDirt: { label: "Dirt", ctor: BooleanFieldModel },
        conditionsSurfaceOther: { label: "Other", ctor: BooleanFieldModel, name: "conditions-surface-other" },
        conditionsTrafficLight: { label: "Light", ctor: BooleanFieldModel },
        conditionsTrafficMedium: { label: "Medium", ctor: BooleanFieldModel },
        conditionsTrafficHeavy: { label: "Heavy", ctor: BooleanFieldModel },
        conditionsLightingDaylight: { label: "Daylight", ctor: BooleanFieldModel },
        conditionsLightingDarkness: { label: "Darkness", ctor: BooleanFieldModel },
        conditionsLightingOther: { label: "Other", ctor: BooleanFieldModel, name: "conditions-lighting-other" },
        conditionsSixteenPlusPassengers: { label: "16+ Passengers", ctor: BooleanFieldModel },
        conditionsCommercialVehicle: { label: "Commercial Vehicle Violation", ctor: BooleanFieldModel },
        conditionsHazardousMaterial: { label: "Hazardous Material Violation", ctor: BooleanFieldModel }
    });

    readonly locationSection: SectionDefinition<LocationSectionModel> = DefinitionFactory.section<LocationSectionModel>("location-section", this.citationPage, LocationSectionModel, { isShared: true });
    readonly locationFields = defineFields(this.locationSection, {
        locationCity: { label: "In the City of", ctor: StringFieldModel },
        locationCounty: { label: "County of", ctor: OptionFieldModel },
        locationStreet: { label: "Street No., Highway, Road, Street, Intersection, or Private Property", ctor: StringFieldModel }
    });

    readonly officerSection: SectionDefinition<OfficerSectionModel> = DefinitionFactory.section<OfficerSectionModel>("officer-section", this.citationPage, OfficerSectionModel, { isShared: true });
    readonly officerFields = defineFields(this.officerSection, {
        officerName: { label: "Officer Name (Print)", ctor: StringFieldModel },
        officerApdIdNumber: { label: "APD ID No.", ctor: StringFieldModel },
        officerAssignment: { label: "Assignment", ctor: StringFieldModel },
        officerCourtCode: { label: "Court Code", ctor: StringFieldModel },
        officerOffDays: { label: "Off days", ctor: StringFieldModel },
        officerTime: { label: "Time", ctor: StringFieldModel },
        officerSecondName: { label: "2d Officer Name (Print)", ctor: StringFieldModel },
        officerSecondApdIdNumber: { label: "APD ID No.", ctor: StringFieldModel },
        officerSecondAssignment: { label: "Assignment", ctor: StringFieldModel },
        officerSecondCourtCode: { label: "Court Code", ctor: StringFieldModel },
        officerSecondOffDays: { label: "Off days", ctor: StringFieldModel },
        officerSecondTime: { label: "Time", ctor: StringFieldModel }
    });

    readonly summonsSection: SectionDefinition<SummonsSectionModel> = DefinitionFactory.section<SummonsSectionModel>("summons-section", this.citationPage, SummonsSectionModel, { isShared: true });
    readonly summonsFields = defineFields(this.summonsSection, {
        summonsAppearanceDay: { label: "Day", ctor: StringFieldModel, name: "summons-appearance-day" },
        summonsAppearanceMonth: { label: "Month", ctor: StringFieldModel, name: "summons-appearance-month" },
        summonsAppearanceYear: { label: "Yr.", ctor: StringFieldModel, name: "summons-appearance-year" },
        summonsHour: { label: "Hour", ctor: StringFieldModel, name: "summons-hour" },
        summonsMinute: { label: "Minute", ctor: StringFieldModel, name: "summons-minute" },
        summonsAm: { label: "AM", ctor: BooleanFieldModel, name: "summons-am" },
        summonsPm: { label: "PM", ctor: BooleanFieldModel, name: "summons-pm" },
        summonsCourtName: { label: "In the", ctor: StringFieldModel },
        summonsCity: { label: "City", ctor: StringFieldModel, name: "summons-city" },
        summonsCopy: { label: "Copy", ctor: BooleanFieldModel },
        summonsJail: { label: "Jail", ctor: BooleanFieldModel },
        summonsLicenseDisplayedYes: { label: "Yes", ctor: BooleanFieldModel, name: "summons-license-displayed-yes" },
        summonsLicenseDisplayedNo: { label: "No", ctor: BooleanFieldModel, name: "summons-license-displayed-no" },
        summonsReleaseTo: { label: "Release To", ctor: StringFieldModel },
        summonsSignature: { label: "Signature", ctor: StringFieldModel, name: "summons-signature" }
    });

    readonly certificationSection: SectionDefinition<CertificationSectionModel> = DefinitionFactory.section<CertificationSectionModel>("certification-section", this.citationPage, CertificationSectionModel, { isShared: true });
    readonly certificationFields = defineFields(this.certificationSection, {
        certificationOfficerSignature: { label: "Signature", ctor: StringFieldModel },
        certificationSwornDay: { label: "Day", ctor: StringFieldModel, name: "certification-sworn-day" },
        certificationSwornMonth: { label: "Month", ctor: StringFieldModel, name: "certification-sworn-month" },
        certificationSwornYear: { label: "Yr.", ctor: StringFieldModel, name: "certification-sworn-year" },
        certificationSignatureAndTitle: { label: "Signature and Title", ctor: StringFieldModel }
    });

    readonly courtPage: PageDefinition<CourtPageModel> = DefinitionFactory.page<CourtPageModel>("court-page", this.formDefinition, CourtPageModel);

    readonly courtActionSection: SectionDefinition<CourtActionSectionModel> = DefinitionFactory.section<CourtActionSectionModel>("court-action-section", this.courtPage, CourtActionSectionModel);
    readonly courtActionFields = defineFields(this.courtActionSection, {
        courtActionDate: { label: "Date", ctor: StringFieldModel, name: "court-action-date" },
        courtActionComplaintFiled: { label: "Complaint filed", ctor: StringFieldModel },
        courtActionBailFixed: { label: "Bail fixed at $", ctor: StringFieldModel },
        courtActionCashDeposit: { label: "Or cash deposit of $", ctor: StringFieldModel },
        courtActionBailTakenBySignature: { label: "Signature of person taking bail", ctor: StringFieldModel },
        courtActionBailGivenBySignature: { label: "Signature of person giving bail", ctor: StringFieldModel },
        courtActionFineAmount: { label: "Fine in the amount of $", ctor: StringFieldModel },
        courtActionClerkSignature: { label: "Signature of Clerk", ctor: StringFieldModel },
        courtActionFirstContinuance: { label: "Continuance to", ctor: StringFieldModel },
        courtActionFirstContinuanceReason: { label: "Reason", ctor: StringFieldModel },
        courtActionSecondContinuance: { label: "Continuance to", ctor: StringFieldModel },
        courtActionSecondContinuanceReason: { label: "Reason", ctor: StringFieldModel },
        courtActionWarrantIssued: { label: "Warrant Issued", ctor: StringFieldModel },
        courtActionWarrantServed: { label: "Warrant Served", ctor: StringFieldModel },
        courtActionWaivesTrialByJury: { label: "Waives Trial by Jury", ctor: StringFieldModel },
        courtActionArraignmentPlea: { label: "On arraignment, the defendant pleads", ctor: StringFieldModel }
    });

    readonly pleaSection: SectionDefinition<PleaSectionModel> = DefinitionFactory.section<PleaSectionModel>("plea-section", this.courtPage, PleaSectionModel);
    readonly pleaFields = defineFields(this.pleaSection, {
        pleaAccusedName: { label: "Accused", ctor: StringFieldModel },
        pleaChargedWith: { label: "Charged with", ctor: StringFieldModel },
        pleaMinimumMonths: { label: "Minimum months imprisonment", ctor: StringFieldModel },
        pleaMinimumFine: { label: "Minimum fine $", ctor: StringFieldModel },
        pleaMaximumMonths: { label: "Maximum months imprisonment", ctor: StringFieldModel },
        pleaMaximumFine: { label: "Maximum fine $", ctor: StringFieldModel },
        pleaDay: { label: "Day", ctor: StringFieldModel, name: "plea-day" },
        pleaMonth: { label: "Month", ctor: StringFieldModel, name: "plea-month" },
        pleaYear: { label: "Yr.", ctor: StringFieldModel, name: "plea-year" },
        pleaAccusedSignature: { label: "Signature of Accused", ctor: StringFieldModel },
        pleaJudgeName: { label: "Judge", ctor: StringFieldModel },
        pleaJudgeSignature: { label: "Judge Signature", ctor: StringFieldModel }
    });

    readonly dispositionSection: SectionDefinition<DispositionSectionModel> = DefinitionFactory.section<DispositionSectionModel>("disposition-section", this.courtPage, DispositionSectionModel);
    readonly dispositionFields = defineFields(this.dispositionSection, {
        dispositionPleadsGuilty: { label: "(3) Guilty", ctor: BooleanFieldModel },
        dispositionPleadsNotGuilty: { label: "(3) Not Guilty", ctor: BooleanFieldModel },
        dispositionPleadsNoloContendere: { label: "Nolo Contendere", ctor: BooleanFieldModel },
        dispositionTrialJury: { label: "Jury", ctor: BooleanFieldModel },
        dispositionTrialCourtAdjudicated: { label: "Court Adjudicated", ctor: BooleanFieldModel },
        dispositionTrialGuilty: { label: "(1) Guilty", ctor: BooleanFieldModel },
        dispositionTrialNotGuilty: { label: "Not Guilty", ctor: BooleanFieldModel },
        dispositionBondForfeiture: { label: "(2) Bond Forfeiture", ctor: BooleanFieldModel },
        dispositionNolleProssed: { label: "Nolle Prossed", ctor: BooleanFieldModel },
        dispositionDeadDocket: { label: "Dead Docket", ctor: BooleanFieldModel },
        dispositionFineAmount: { label: "Amount of Fine/Forfeiture $", ctor: StringFieldModel },
        dispositionDaysInJail: { label: "No. Days (Months) in Jail", ctor: StringFieldModel },
        dispositionAlcoholDrugRiskReductionSchool: { label: "Alcohol & Drug Risk Reduction School", ctor: BooleanFieldModel },
        dispositionAlcoholDrugAssessment: { label: "Alcohol & Drug Assessment", ctor: BooleanFieldModel },
        dispositionDefensiveDrivingSchool: { label: "Defensive Driving School", ctor: BooleanFieldModel }
    });

    readonly judgmentSection: SectionDefinition<JudgmentSectionModel> = DefinitionFactory.section<JudgmentSectionModel>("judgment-section", this.courtPage, JudgmentSectionModel);
    readonly judgmentFields = defineFields(this.judgmentSection, {
        judgmentFineAmount: { label: "Pay a fine of $", ctor: StringFieldModel },
        judgmentConfinementTerm: { label: "Confined for a term of (days) (months)", ctor: StringFieldModel },
        judgmentDate: { label: "Date", ctor: StringFieldModel, name: "judgment-date" },
        judgmentJudgeSignature: { label: "Signature of Judge", ctor: StringFieldModel },
        judgmentAppealBond: { label: "Appeal Bond of $", ctor: StringFieldModel }
    });

    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
