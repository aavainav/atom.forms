import {
    defineFields,
    ISchema,
    DefinitionFactory,
    FieldDefinition,
    FormDefinition,
    PageDefinition,
    RuleCollection,
    Schema,
    SectionDefinition,
    BooleanFieldModel,
    HiddenFieldModel,
    NumberFieldModel,
    OptionFieldModel,
    StringFieldModel
} from "@forms/core";
import { createRuleCollection } from "./tr310-rules";
import { TR310FormModel } from "./tr310-form";
import { CollisionPageModel } from "./collision-page/collision-page";
import { HeaderSectionModel } from "./collision-page/header-section";
import { CollisionSectionModel } from "./collision-page/collision-section";
import { RouteSectionModel } from "./collision-page/route-section";
import { BaseIntersectionSectionModel } from "./collision-page/base-intersection-section";
import { SecondIntersectionSectionModel } from "./collision-page/second-intersection-section";
import { CoordinatesSectionModel } from "./collision-page/coordinates-section";
import { TrafficwaySectionModel } from "./collision-page/trafficway-section";
import { BarrierSectionModel } from "./collision-page/barrier-section";
import { ConditionsSectionModel } from "./collision-page/conditions-section";
import { HarmfulEventSectionModel } from "./collision-page/harmful-event-section";
import { JunctionSectionModel } from "./collision-page/junction-section";
import { WorkZoneSectionModel } from "./collision-page/work-zone-section";
import { WitnessSectionModel } from "./collision-page/witness-section";
import { CollisionOfficerSectionModel } from "./collision-page/collision-officer-section";
import { PersonPageModel } from "./person-page/person-page";
import { PersonHeaderSectionModel } from "./person-page/person-header-section";
import { PersonSectionModel } from "./person-page/person-section";
import { DriverLicenseSectionModel } from "./person-page/driver-license-section";
import { DriverActionsSectionModel } from "./person-page/driver-actions-section";
import { OccupantSectionModel } from "./person-page/occupant-section";
import { NonMotoristSectionModel } from "./person-page/non-motorist-section";
import { InjurySectionModel } from "./person-page/injury-section";
import { SafetyEquipmentSectionModel } from "./person-page/safety-equipment-section";
import { AlcoholDrugsSectionModel } from "./person-page/alcohol-drugs-section";
import { PassengersSectionModel } from "./person-page/passengers-section";
import { PersonOfficerSectionModel } from "./person-page/person-officer-section";
import { UnitPageModel } from "./unit-page/unit-page";
import { UnitHeaderSectionModel } from "./unit-page/unit-header-section";
import { VehicleSectionModel } from "./unit-page/vehicle-section";
import { InsuranceSectionModel } from "./unit-page/insurance-section";
import { OwnerSectionModel } from "./unit-page/owner-section";
import { TravelSectionModel } from "./unit-page/travel-section";
import { DamageSectionModel } from "./unit-page/damage-section";
import { UnitTypeSectionModel } from "./unit-page/unit-type-section";
import { EventsSectionModel } from "./unit-page/events-section";
import { RoadwaySectionModel } from "./unit-page/roadway-section";
import { ViolationsSectionModel } from "./unit-page/violations-section";
import { UnitOfficerSectionModel } from "./unit-page/unit-officer-section";
import { NarrativePageModel } from "./narrative-page/narrative-page";
import { NarrativeHeaderSectionModel } from "./narrative-page/narrative-header-section";
import { NarrativeSectionModel } from "./narrative-page/narrative-section";
import { DiagramSectionModel } from "./narrative-page/diagram-section";
import { AdditionalPassengersSectionModel } from "./narrative-page/additional-passengers-section";
import { NarrativeOfficerSectionModel } from "./narrative-page/narrative-officer-section";

export interface ITR310FormSchema extends ISchema {
    readonly collisionPage: PageDefinition<CollisionPageModel>;
    readonly personPage: PageDefinition<PersonPageModel>;
    readonly unitPage: PageDefinition<UnitPageModel>;
    readonly narrativePage: PageDefinition<NarrativePageModel>;

    readonly headerSection: SectionDefinition<HeaderSectionModel>;
    readonly headerFields: {
        readonly headerPageNumber: FieldDefinition<StringFieldModel>;
        readonly headerPageCount: FieldDefinition<StringFieldModel>;
        readonly headerVersion: FieldDefinition<StringFieldModel>;
        readonly headerUnitCount: FieldDefinition<NumberFieldModel>;
        readonly headerCrashReportNumber: FieldDefinition<StringFieldModel>;
        readonly headerAmended: FieldDefinition<StringFieldModel>;
        readonly headerCorrected: FieldDefinition<StringFieldModel>;
        readonly headerOfficerNotified: FieldDefinition<StringFieldModel>;
        readonly headerOfficerArrived: FieldDefinition<StringFieldModel>;
        readonly headerRoadwayCleared: FieldDefinition<StringFieldModel>;
    };

    readonly collisionSection: SectionDefinition<CollisionSectionModel>;
    readonly collisionFields: {
        readonly collisionDate: FieldDefinition<StringFieldModel>;
        readonly collisionTime: FieldDefinition<StringFieldModel>;
        readonly collisionCounty: FieldDefinition<OptionFieldModel>;
        readonly collisionCityOrTown: FieldDefinition<StringFieldModel>;
        readonly collisionSecondaryCrash: FieldDefinition<OptionFieldModel>;
        readonly collisionPrivatePropertyCollision: FieldDefinition<OptionFieldModel>;
        readonly collisionTotalDamageOverThreshold: FieldDefinition<OptionFieldModel>;
        readonly collisionPicturesTaken: FieldDefinition<BooleanFieldModel>;
    };

    readonly routeSection: SectionDefinition<RouteSectionModel>;
    readonly routeFields: {
        readonly routeCategory: FieldDefinition<StringFieldModel>;
        readonly routeAuxiliary: FieldDefinition<StringFieldModel>;
        readonly routeNumber: FieldDefinition<StringFieldModel>;
        readonly routeName: FieldDefinition<StringFieldModel>;
        readonly routeRailroadId: FieldDefinition<StringFieldModel>;
        readonly routeLaneNumber: FieldDefinition<StringFieldModel>;
        readonly routeLaneCount: FieldDefinition<StringFieldModel>;
        readonly routeDistanceOffsetMiles: FieldDefinition<StringFieldModel>;
        readonly routeDistanceOffsetFeet: FieldDefinition<StringFieldModel>;
        readonly routeDirection: FieldDefinition<StringFieldModel>;
    };

    readonly baseIntersectionSection: SectionDefinition<BaseIntersectionSectionModel>;
    readonly baseIntersectionFields: {
        readonly baseIntersectionCategory: FieldDefinition<StringFieldModel>;
        readonly baseIntersectionAuxiliary: FieldDefinition<StringFieldModel>;
        readonly baseIntersectionRouteNumber: FieldDefinition<StringFieldModel>;
        readonly baseIntersectionRouteName: FieldDefinition<StringFieldModel>;
    };

    readonly secondIntersectionSection: SectionDefinition<SecondIntersectionSectionModel>;
    readonly secondIntersectionFields: {
        readonly secondIntersectionCategory: FieldDefinition<StringFieldModel>;
        readonly secondIntersectionAuxiliary: FieldDefinition<StringFieldModel>;
        readonly secondIntersectionRouteNumber: FieldDefinition<StringFieldModel>;
        readonly secondIntersectionRouteName: FieldDefinition<StringFieldModel>;
    };

    readonly coordinatesSection: SectionDefinition<CoordinatesSectionModel>;
    readonly coordinatesFields: {
        readonly coordinatesLatitude: FieldDefinition<StringFieldModel>;
        readonly coordinatesLongitude: FieldDefinition<StringFieldModel>;
    };

    readonly trafficwaySection: SectionDefinition<TrafficwaySectionModel>;
    readonly trafficwayFields: {
        readonly trafficwayDirection: FieldDefinition<OptionFieldModel>;
        readonly trafficwayDivided: FieldDefinition<OptionFieldModel>;
    };

    readonly barrierSection: SectionDefinition<BarrierSectionModel>;
    readonly barrierFields: {
        readonly barrierType: FieldDefinition<OptionFieldModel>;
        readonly barrierIntersectionType: FieldDefinition<OptionFieldModel>;
    };

    readonly conditionsSection: SectionDefinition<ConditionsSectionModel>;
    readonly conditionsFields: {
        readonly conditionsLight: FieldDefinition<OptionFieldModel>;
        readonly conditionsWeatherFirst: FieldDefinition<OptionFieldModel>;
        readonly conditionsWeatherSecond: FieldDefinition<OptionFieldModel>;
        readonly conditionsRoadSurface: FieldDefinition<OptionFieldModel>;
        readonly conditionsMannerOfCollision: FieldDefinition<OptionFieldModel>;
    };

    readonly harmfulEventSection: SectionDefinition<HarmfulEventSectionModel>;
    readonly harmfulEventFields: {
        readonly harmfulEventFirst: FieldDefinition<OptionFieldModel>;
        readonly harmfulEventLocation: FieldDefinition<OptionFieldModel>;
    };

    readonly junctionSection: SectionDefinition<JunctionSectionModel>;
    readonly junctionFields: {
        readonly junctionRelation: FieldDefinition<OptionFieldModel>;
        readonly junctionContributingFactorFirst: FieldDefinition<OptionFieldModel>;
        readonly junctionContributingFactorSecond: FieldDefinition<OptionFieldModel>;
        readonly junctionSchoolBusRelated: FieldDefinition<OptionFieldModel>;
    };

    readonly workZoneSection: SectionDefinition<WorkZoneSectionModel>;
    readonly workZoneFields: {
        readonly workZoneRelated: FieldDefinition<OptionFieldModel>;
        readonly workZoneCrashLocation: FieldDefinition<OptionFieldModel>;
        readonly workZoneType: FieldDefinition<OptionFieldModel>;
        readonly workZoneWorkerPresent: FieldDefinition<OptionFieldModel>;
        readonly workZoneLawEnforcement: FieldDefinition<OptionFieldModel>;
    };

    readonly witnessSection: SectionDefinition<WitnessSectionModel>;
    readonly witnessFields: {
        readonly witnessOneType: FieldDefinition<StringFieldModel>;
        readonly witnessOneFirstName: FieldDefinition<StringFieldModel>;
        readonly witnessOneMiddleInitial: FieldDefinition<StringFieldModel>;
        readonly witnessOneLastName: FieldDefinition<StringFieldModel>;
        readonly witnessOneAddress: FieldDefinition<StringFieldModel>;
        readonly witnessOneCity: FieldDefinition<StringFieldModel>;
        readonly witnessOneState: FieldDefinition<OptionFieldModel>;
        readonly witnessOneZipCode: FieldDefinition<StringFieldModel>;
        readonly witnessOneTelephone: FieldDefinition<StringFieldModel>;
        readonly witnessOnePropertyDamageAmount: FieldDefinition<StringFieldModel>;
        readonly witnessOnePropertyDamageDescription: FieldDefinition<StringFieldModel>;
        readonly witnessTwoType: FieldDefinition<StringFieldModel>;
        readonly witnessTwoFirstName: FieldDefinition<StringFieldModel>;
        readonly witnessTwoMiddleInitial: FieldDefinition<StringFieldModel>;
        readonly witnessTwoLastName: FieldDefinition<StringFieldModel>;
        readonly witnessTwoAddress: FieldDefinition<StringFieldModel>;
        readonly witnessTwoCity: FieldDefinition<StringFieldModel>;
        readonly witnessTwoState: FieldDefinition<OptionFieldModel>;
        readonly witnessTwoZipCode: FieldDefinition<StringFieldModel>;
        readonly witnessTwoTelephone: FieldDefinition<StringFieldModel>;
        readonly witnessTwoPropertyDamageAmount: FieldDefinition<StringFieldModel>;
        readonly witnessTwoPropertyDamageDescription: FieldDefinition<StringFieldModel>;
        readonly witnessThreeType: FieldDefinition<StringFieldModel>;
        readonly witnessThreeFirstName: FieldDefinition<StringFieldModel>;
        readonly witnessThreeMiddleInitial: FieldDefinition<StringFieldModel>;
        readonly witnessThreeLastName: FieldDefinition<StringFieldModel>;
        readonly witnessThreeAddress: FieldDefinition<StringFieldModel>;
        readonly witnessThreeCity: FieldDefinition<StringFieldModel>;
        readonly witnessThreeState: FieldDefinition<OptionFieldModel>;
        readonly witnessThreeZipCode: FieldDefinition<StringFieldModel>;
        readonly witnessThreeTelephone: FieldDefinition<StringFieldModel>;
        readonly witnessThreePropertyDamageAmount: FieldDefinition<StringFieldModel>;
        readonly witnessThreePropertyDamageDescription: FieldDefinition<StringFieldModel>;
    };

    readonly collisionOfficerSection: SectionDefinition<CollisionOfficerSectionModel>;
    readonly collisionOfficerFields: {
        readonly collisionOfficerName: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerRank: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerCjaNumber: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerJurisdiction: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerReviewerName: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerReviewerRank: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerReviewDate: FieldDefinition<StringFieldModel>;
        readonly collisionOfficerInternalAgency: FieldDefinition<StringFieldModel>;
    };

    readonly personHeaderSection: SectionDefinition<PersonHeaderSectionModel>;
    readonly personHeaderFields: {
        readonly personHeaderPersonNumber: FieldDefinition<StringFieldModel>;
        readonly personHeaderUnitNumber: FieldDefinition<StringFieldModel>;
        readonly personHeaderPersonType: FieldDefinition<OptionFieldModel>;
        readonly personHeaderCrashReportNumber: FieldDefinition<StringFieldModel>;
        readonly personHeaderPersonId: FieldDefinition<HiddenFieldModel>;
    };

    readonly personSection: SectionDefinition<PersonSectionModel>;
    readonly personFields: {
        readonly personFirstName: FieldDefinition<StringFieldModel>;
        readonly personMiddleName: FieldDefinition<StringFieldModel>;
        readonly personLastName: FieldDefinition<StringFieldModel>;
        readonly personPhoneNumber: FieldDefinition<StringFieldModel>;
        readonly personContributedTo: FieldDefinition<OptionFieldModel>;
        readonly personDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly personAddress: FieldDefinition<StringFieldModel>;
        readonly personCity: FieldDefinition<StringFieldModel>;
        readonly personState: FieldDefinition<OptionFieldModel>;
        readonly personZipCode: FieldDefinition<StringFieldModel>;
        readonly personSex: FieldDefinition<OptionFieldModel>;
        readonly personRace: FieldDefinition<StringFieldModel>;
    };

    readonly driverLicenseSection: SectionDefinition<DriverLicenseSectionModel>;
    readonly driverLicenseFields: {
        readonly driverLicenseNumber: FieldDefinition<StringFieldModel>;
        readonly driverLicenseState: FieldDefinition<OptionFieldModel>;
        readonly driverLicenseClass: FieldDefinition<StringFieldModel>;
        readonly driverLicenseJurisdiction: FieldDefinition<OptionFieldModel>;
    };

    readonly driverActionsSection: SectionDefinition<DriverActionsSectionModel>;
    readonly driverActionsFields: {
        readonly driverActionsDistraction: FieldDefinition<OptionFieldModel>;
        readonly driverActionsFirst: FieldDefinition<OptionFieldModel>;
        readonly driverActionsSecond: FieldDefinition<OptionFieldModel>;
        readonly driverActionsThird: FieldDefinition<OptionFieldModel>;
        readonly driverActionsFourth: FieldDefinition<OptionFieldModel>;
    };

    readonly occupantSection: SectionDefinition<OccupantSectionModel>;
    readonly occupantFields: {
        readonly occupantSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly occupantEjection: FieldDefinition<OptionFieldModel>;
        readonly occupantMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly occupantHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly occupantAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly occupantRestraintDevice: FieldDefinition<OptionFieldModel>;
    };

    readonly nonMotoristSection: SectionDefinition<NonMotoristSectionModel>;
    readonly nonMotoristFields: {
        readonly nonMotoristUnitType: FieldDefinition<OptionFieldModel>;
        readonly nonMotoristDistraction: FieldDefinition<OptionFieldModel>;
    };

    readonly injurySection: SectionDefinition<InjurySectionModel>;
    readonly injuryFields: {
        readonly injuryStatus: FieldDefinition<OptionFieldModel>;
        readonly injuryContributingActionFirst: FieldDefinition<OptionFieldModel>;
        readonly injuryContributingActionSecond: FieldDefinition<OptionFieldModel>;
        readonly injuryActionPriorToImpact: FieldDefinition<OptionFieldModel>;
    };

    readonly safetyEquipmentSection: SectionDefinition<SafetyEquipmentSectionModel>;
    readonly safetyEquipmentFields: {
        readonly safetyEquipmentHelmetUse: FieldDefinition<OptionFieldModel>;
        readonly safetyEquipmentProtectivePadsUse: FieldDefinition<OptionFieldModel>;
        readonly safetyEquipmentOtherProtectiveUse: FieldDefinition<OptionFieldModel>;
        readonly safetyEquipmentReflectiveClothingUse: FieldDefinition<OptionFieldModel>;
        readonly safetyEquipmentLightingUse: FieldDefinition<OptionFieldModel>;
        readonly safetyEquipmentOtherPreventativeUse: FieldDefinition<OptionFieldModel>;
    };

    readonly alcoholDrugsSection: SectionDefinition<AlcoholDrugsSectionModel>;
    readonly alcoholDrugsFields: {
        readonly alcoholDrugsSuspectedUse: FieldDefinition<OptionFieldModel>;
        readonly alcoholDrugsAlcoholTestStatus: FieldDefinition<OptionFieldModel>;
        readonly alcoholDrugsAlcoholTestType: FieldDefinition<OptionFieldModel>;
        readonly alcoholDrugsBloodAlcoholContent: FieldDefinition<StringFieldModel>;
        readonly alcoholDrugsDrugTestStatus: FieldDefinition<OptionFieldModel>;
        readonly alcoholDrugsDrugTestType: FieldDefinition<OptionFieldModel>;
        readonly alcoholDrugsDrugTestResult: FieldDefinition<OptionFieldModel>;
    };

    readonly passengersSection: SectionDefinition<PassengersSectionModel>;
    readonly passengersFields: {
        readonly passengerOnePersonNumber: FieldDefinition<StringFieldModel>;
        readonly passengerOneUnitNumber: FieldDefinition<StringFieldModel>;
        readonly passengerOneNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly passengerOneDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly passengerOneInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly passengerOneSex: FieldDefinition<OptionFieldModel>;
        readonly passengerOneRace: FieldDefinition<StringFieldModel>;
        readonly passengerOneSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly passengerOneEjection: FieldDefinition<OptionFieldModel>;
        readonly passengerOneMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly passengerOneAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly passengerOneSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly passengerOneRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly passengerOneHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoPersonNumber: FieldDefinition<StringFieldModel>;
        readonly passengerTwoUnitNumber: FieldDefinition<StringFieldModel>;
        readonly passengerTwoNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly passengerTwoDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly passengerTwoInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoSex: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoRace: FieldDefinition<StringFieldModel>;
        readonly passengerTwoSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly passengerTwoEjection: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly passengerTwoHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly passengerThreePersonNumber: FieldDefinition<StringFieldModel>;
        readonly passengerThreeUnitNumber: FieldDefinition<StringFieldModel>;
        readonly passengerThreeNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly passengerThreeDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly passengerThreeInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeSex: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeRace: FieldDefinition<StringFieldModel>;
        readonly passengerThreeSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly passengerThreeEjection: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly passengerThreeHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly passengerFourPersonNumber: FieldDefinition<StringFieldModel>;
        readonly passengerFourUnitNumber: FieldDefinition<StringFieldModel>;
        readonly passengerFourNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly passengerFourDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly passengerFourInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly passengerFourSex: FieldDefinition<OptionFieldModel>;
        readonly passengerFourRace: FieldDefinition<StringFieldModel>;
        readonly passengerFourSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly passengerFourEjection: FieldDefinition<OptionFieldModel>;
        readonly passengerFourMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly passengerFourAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly passengerFourSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly passengerFourRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly passengerFourHeadInjury: FieldDefinition<OptionFieldModel>;
    };

    readonly personOfficerSection: SectionDefinition<PersonOfficerSectionModel>;
    readonly personOfficerFields: {
        readonly personOfficerName: FieldDefinition<StringFieldModel>;
        readonly personOfficerRank: FieldDefinition<StringFieldModel>;
        readonly personOfficerCjaNumber: FieldDefinition<StringFieldModel>;
        readonly personOfficerInternalAgency: FieldDefinition<StringFieldModel>;
    };

    readonly unitHeaderSection: SectionDefinition<UnitHeaderSectionModel>;
    readonly unitHeaderFields: {
        readonly unitHeaderUnitNumber: FieldDefinition<StringFieldModel>;
        readonly unitHeaderFr10Number: FieldDefinition<StringFieldModel>;
        readonly unitHeaderCrashReportNumber: FieldDefinition<StringFieldModel>;
        readonly unitHeaderUnitId: FieldDefinition<HiddenFieldModel>;
    };

    readonly vehicleSection: SectionDefinition<VehicleSectionModel>;
    readonly vehicleFields: {
        readonly vehicleStatus: FieldDefinition<OptionFieldModel>;
        readonly vehiclePlateNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleState: FieldDefinition<OptionFieldModel>;
        readonly vehiclePlateExpires: FieldDefinition<StringFieldModel>;
        readonly vehicleIdentificationNumber: FieldDefinition<StringFieldModel>;
        readonly vehicleDamageExtent: FieldDefinition<OptionFieldModel>;
        readonly vehicleHitAndRun: FieldDefinition<OptionFieldModel>;
        readonly vehicleYear: FieldDefinition<NumberFieldModel>;
        readonly vehicleMake: FieldDefinition<OptionFieldModel>;
        readonly vehicleModel: FieldDefinition<OptionFieldModel>;
        readonly vehicleBodyType: FieldDefinition<StringFieldModel>;
        readonly vehicleOccupantCount: FieldDefinition<NumberFieldModel>;
    };

    readonly insuranceSection: SectionDefinition<InsuranceSectionModel>;
    readonly insuranceFields: {
        readonly insuranceCompany: FieldDefinition<StringFieldModel>;
        readonly insuranceCdlRequired: FieldDefinition<OptionFieldModel>;
        readonly insuranceTowed: FieldDefinition<OptionFieldModel>;
        readonly insuranceTowedBy: FieldDefinition<StringFieldModel>;
        readonly insuranceEstimatedDamage: FieldDefinition<StringFieldModel>;
    };

    readonly ownerSection: SectionDefinition<OwnerSectionModel>;
    readonly ownerFields: {
        readonly ownerFirstName: FieldDefinition<StringFieldModel>;
        readonly ownerMiddleName: FieldDefinition<StringFieldModel>;
        readonly ownerLastName: FieldDefinition<StringFieldModel>;
        readonly ownerAddress: FieldDefinition<StringFieldModel>;
        readonly ownerCity: FieldDefinition<StringFieldModel>;
        readonly ownerState: FieldDefinition<OptionFieldModel>;
        readonly ownerZipCode: FieldDefinition<StringFieldModel>;
        readonly ownerDriverLicenseNumber: FieldDefinition<StringFieldModel>;
    };

    readonly travelSection: SectionDefinition<TravelSectionModel>;
    readonly travelFields: {
        readonly travelDirection: FieldDefinition<OptionFieldModel>;
        readonly travelSpeedRelated: FieldDefinition<OptionFieldModel>;
        readonly travelEstimatedSpeed: FieldDefinition<StringFieldModel>;
        readonly travelSpeedLimit: FieldDefinition<StringFieldModel>;
    };

    readonly damageSection: SectionDefinition<DamageSectionModel>;
    readonly damageFields: {
        readonly damageInitialPointOfContact: FieldDefinition<OptionFieldModel>;
        readonly damageAreaOne: FieldDefinition<OptionFieldModel>;
        readonly damageAreaTwo: FieldDefinition<OptionFieldModel>;
        readonly damageAreaThree: FieldDefinition<OptionFieldModel>;
        readonly damageAreaFour: FieldDefinition<OptionFieldModel>;
        readonly damageAreaFive: FieldDefinition<OptionFieldModel>;
        readonly damageAreaSix: FieldDefinition<OptionFieldModel>;
        readonly damageAreaSeven: FieldDefinition<OptionFieldModel>;
        readonly damageAreaEight: FieldDefinition<OptionFieldModel>;
        readonly damageAreaNine: FieldDefinition<OptionFieldModel>;
        readonly damageAreaTen: FieldDefinition<OptionFieldModel>;
        readonly damageAreaEleven: FieldDefinition<OptionFieldModel>;
        readonly damageAreaTwelve: FieldDefinition<OptionFieldModel>;
    };

    readonly unitTypeSection: SectionDefinition<UnitTypeSectionModel>;
    readonly unitTypeFields: {
        readonly unitTypeUnit: FieldDefinition<OptionFieldModel>;
        readonly unitTypeEmergencyVehicleUse: FieldDefinition<OptionFieldModel>;
        readonly unitTypeSpecialFunction: FieldDefinition<OptionFieldModel>;
    };

    readonly eventsSection: SectionDefinition<EventsSectionModel>;
    readonly eventsFields: {
        readonly eventsMostHarmful: FieldDefinition<OptionFieldModel>;
        readonly eventsSequenceFirst: FieldDefinition<OptionFieldModel>;
        readonly eventsSequenceSecond: FieldDefinition<OptionFieldModel>;
        readonly eventsSequenceThird: FieldDefinition<OptionFieldModel>;
        readonly eventsSequenceFourth: FieldDefinition<OptionFieldModel>;
    };

    readonly roadwaySection: SectionDefinition<RoadwaySectionModel>;
    readonly roadwayFields: {
        readonly roadwayGrade: FieldDefinition<OptionFieldModel>;
        readonly roadwayAlignment: FieldDefinition<OptionFieldModel>;
        readonly roadwayVehicleActionPriorToImpact: FieldDefinition<OptionFieldModel>;
        readonly roadwayTrafficControlDeviceFirst: FieldDefinition<OptionFieldModel>;
        readonly roadwayTrafficControlDeviceSecond: FieldDefinition<OptionFieldModel>;
        readonly roadwayTrafficControlDeviceThird: FieldDefinition<OptionFieldModel>;
        readonly roadwayTrafficControlDeviceFourth: FieldDefinition<OptionFieldModel>;
        readonly roadwayVehicleContributingCircumstances: FieldDefinition<OptionFieldModel>;
    };

    readonly violationsSection: SectionDefinition<ViolationsSectionModel>;
    readonly violationsFields: {
        readonly violationOneStatuteNumber: FieldDefinition<StringFieldModel>;
        readonly violationOneCharge: FieldDefinition<StringFieldModel>;
        readonly violationOneTicketNumber: FieldDefinition<StringFieldModel>;
        readonly violationTwoStatuteNumber: FieldDefinition<StringFieldModel>;
        readonly violationTwoCharge: FieldDefinition<StringFieldModel>;
        readonly violationTwoTicketNumber: FieldDefinition<StringFieldModel>;
    };

    readonly unitOfficerSection: SectionDefinition<UnitOfficerSectionModel>;
    readonly unitOfficerFields: {
        readonly unitOfficerName: FieldDefinition<StringFieldModel>;
        readonly unitOfficerRank: FieldDefinition<StringFieldModel>;
        readonly unitOfficerCjaNumber: FieldDefinition<StringFieldModel>;
        readonly unitOfficerInternalAgency: FieldDefinition<StringFieldModel>;
    };

    readonly narrativeHeaderSection: SectionDefinition<NarrativeHeaderSectionModel>;
    readonly narrativeHeaderFields: {
        readonly narrativeHeaderInternalAgencyCode: FieldDefinition<StringFieldModel>;
        readonly narrativeHeaderCrashReportNumber: FieldDefinition<StringFieldModel>;
    };

    readonly narrativeSection: SectionDefinition<NarrativeSectionModel>;
    readonly narrativeFields: {
        readonly narrativeText: FieldDefinition<StringFieldModel>;
        readonly narrativeAmendedOrCorrectedNotes: FieldDefinition<StringFieldModel>;
    };

    readonly diagramSection: SectionDefinition<DiagramSectionModel>;
    readonly diagramFields: {
        readonly diagramContent: FieldDefinition<StringFieldModel>;
    };

    readonly additionalPassengersSection: SectionDefinition<AdditionalPassengersSectionModel>;
    readonly additionalPassengersFields: {
        readonly additionalPassengerOnePersonNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneUnitNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneSex: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneRace: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerOneEjection: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerOneHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoPersonNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoUnitNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoSex: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoRace: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerTwoEjection: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerTwoHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreePersonNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeUnitNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeSex: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeRace: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerThreeEjection: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerThreeHeadInjury: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourPersonNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourUnitNumber: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourNameAndAddress: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourDateOfBirth: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourInjuryStatus: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourSex: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourRace: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourSeatingLocation: FieldDefinition<StringFieldModel>;
        readonly additionalPassengerFourEjection: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourMedicalFacilityTransport: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourAirBagDeployment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourSafetyEquipment: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourRestraintDevice: FieldDefinition<OptionFieldModel>;
        readonly additionalPassengerFourHeadInjury: FieldDefinition<OptionFieldModel>;
    };

    readonly narrativeOfficerSection: SectionDefinition<NarrativeOfficerSectionModel>;
    readonly narrativeOfficerFields: {
        readonly narrativeOfficerName: FieldDefinition<StringFieldModel>;
        readonly narrativeOfficerRank: FieldDefinition<StringFieldModel>;
        readonly narrativeOfficerCjaNumber: FieldDefinition<StringFieldModel>;
        readonly narrativeOfficerInternalAgency: FieldDefinition<StringFieldModel>;
    };

    readonly ruleCollection: RuleCollection;
}

/** Represents the schema definition for the SC TR-310 traffic collision report, defining its pages, sections, and fields. */
export class TR310FormSchema extends Schema implements ITR310FormSchema {
    readonly formDefinition: FormDefinition<TR310FormModel> = DefinitionFactory.form<TR310FormModel>("tr310-form", TR310FormModel, this);

    readonly collisionPage: PageDefinition<CollisionPageModel> = DefinitionFactory.page<CollisionPageModel>("collision-page", this.formDefinition, CollisionPageModel);

    readonly headerSection: SectionDefinition<HeaderSectionModel> = DefinitionFactory.section<HeaderSectionModel>("header-section", this.collisionPage, HeaderSectionModel);
    readonly headerFields = defineFields(this.headerSection, {
        headerPageNumber: { label: "Page #", ctor: StringFieldModel },
        headerPageCount: { label: "Of", ctor: StringFieldModel },
        headerVersion: { label: "Ver", ctor: StringFieldModel },
        headerUnitCount: { label: "# of Units", ctor: NumberFieldModel },
        headerCrashReportNumber: { label: "SCDPS Crash Report Number", ctor: StringFieldModel },
        headerAmended: { label: "Amended", ctor: StringFieldModel },
        headerCorrected: { label: "Corrected", ctor: StringFieldModel },
        headerOfficerNotified: { label: "Officer Notified", ctor: StringFieldModel },
        headerOfficerArrived: { label: "Officer Arrived", ctor: StringFieldModel },
        headerRoadwayCleared: { label: "Roadway Cleared", ctor: StringFieldModel }
    });

    readonly collisionSection: SectionDefinition<CollisionSectionModel> = DefinitionFactory.section<CollisionSectionModel>("collision-section", this.collisionPage, CollisionSectionModel);
    readonly collisionFields = defineFields(this.collisionSection, {
        collisionDate: { label: "Date", ctor: StringFieldModel },
        collisionTime: { label: "Time", ctor: StringFieldModel },
        collisionCounty: { label: "County", ctor: OptionFieldModel },
        collisionCityOrTown: { label: "In City/Town Name", ctor: StringFieldModel },
        collisionSecondaryCrash: { label: "Secondary Crash?", ctor: OptionFieldModel },
        collisionPrivatePropertyCollision: { label: "Private Property Collison", ctor: OptionFieldModel },
        collisionTotalDamageOverThreshold: { label: "Total Damage in Collision $1000 or More", ctor: OptionFieldModel },
        collisionPicturesTaken: { label: "Crash Information (Check if Pictures Taken)", ctor: BooleanFieldModel }
    });

    readonly routeSection: SectionDefinition<RouteSectionModel> = DefinitionFactory.section<RouteSectionModel>("route-section", this.collisionPage, RouteSectionModel);
    readonly routeFields = defineFields(this.routeSection, {
        routeCategory: { label: "Category", ctor: StringFieldModel },
        routeAuxiliary: { label: "Auxiliary", ctor: StringFieldModel },
        routeNumber: { label: "Route #", ctor: StringFieldModel },
        routeName: { label: "Route Name", ctor: StringFieldModel },
        routeRailroadId: { label: "R.R. ID", ctor: StringFieldModel },
        routeLaneNumber: { label: "Lane #", ctor: StringFieldModel },
        routeLaneCount: { label: "Of", ctor: StringFieldModel },
        routeDistanceOffsetMiles: { label: "Miles", ctor: StringFieldModel },
        routeDistanceOffsetFeet: { label: "Feet", ctor: StringFieldModel },
        routeDirection: { label: "Direction", ctor: StringFieldModel }
    });

    readonly baseIntersectionSection: SectionDefinition<BaseIntersectionSectionModel> = DefinitionFactory.section<BaseIntersectionSectionModel>("base-intersection-section", this.collisionPage, BaseIntersectionSectionModel);
    readonly baseIntersectionFields = defineFields(this.baseIntersectionSection, {
        baseIntersectionCategory: { label: "Category", ctor: StringFieldModel },
        baseIntersectionAuxiliary: { label: "Auxiliary", ctor: StringFieldModel },
        baseIntersectionRouteNumber: { label: "Route #", ctor: StringFieldModel },
        baseIntersectionRouteName: { label: "Route Name", ctor: StringFieldModel }
    });

    readonly secondIntersectionSection: SectionDefinition<SecondIntersectionSectionModel> = DefinitionFactory.section<SecondIntersectionSectionModel>("second-intersection-section", this.collisionPage, SecondIntersectionSectionModel);
    readonly secondIntersectionFields = defineFields(this.secondIntersectionSection, {
        secondIntersectionCategory: { label: "Category", ctor: StringFieldModel },
        secondIntersectionAuxiliary: { label: "Auxiliary", ctor: StringFieldModel },
        secondIntersectionRouteNumber: { label: "Route #", ctor: StringFieldModel },
        secondIntersectionRouteName: { label: "Route Name", ctor: StringFieldModel }
    });

    readonly coordinatesSection: SectionDefinition<CoordinatesSectionModel> = DefinitionFactory.section<CoordinatesSectionModel>("coordinates-section", this.collisionPage, CoordinatesSectionModel);
    readonly coordinatesFields = defineFields(this.coordinatesSection, {
        coordinatesLatitude: { label: "", ctor: StringFieldModel },
        coordinatesLongitude: { label: "", ctor: StringFieldModel }
    });

    readonly trafficwaySection: SectionDefinition<TrafficwaySectionModel> = DefinitionFactory.section<TrafficwaySectionModel>("trafficway-section", this.collisionPage, TrafficwaySectionModel);
    readonly trafficwayFields = defineFields(this.trafficwaySection, {
        trafficwayDirection: { label: "Trafficway Direction", ctor: OptionFieldModel },
        trafficwayDivided: { label: "Trafficway Divided", ctor: OptionFieldModel }
    });

    readonly barrierSection: SectionDefinition<BarrierSectionModel> = DefinitionFactory.section<BarrierSectionModel>("barrier-section", this.collisionPage, BarrierSectionModel);
    readonly barrierFields = defineFields(this.barrierSection, {
        barrierType: { label: "Barrier Type", ctor: OptionFieldModel },
        barrierIntersectionType: { label: "Type of Intersection", ctor: OptionFieldModel }
    });

    readonly conditionsSection: SectionDefinition<ConditionsSectionModel> = DefinitionFactory.section<ConditionsSectionModel>("conditions-section", this.collisionPage, ConditionsSectionModel);
    readonly conditionsFields = defineFields(this.conditionsSection, {
        conditionsLight: { label: "Light Condition", ctor: OptionFieldModel },
        conditionsWeatherFirst: { label: "Weather Condition 1", ctor: OptionFieldModel },
        conditionsWeatherSecond: { label: "Weather Condition 2", ctor: OptionFieldModel },
        conditionsRoadSurface: { label: "Road Surface Condition", ctor: OptionFieldModel },
        conditionsMannerOfCollision: { label: "Manner of Collision", ctor: OptionFieldModel }
    });

    readonly harmfulEventSection: SectionDefinition<HarmfulEventSectionModel> = DefinitionFactory.section<HarmfulEventSectionModel>("harmful-event-section", this.collisionPage, HarmfulEventSectionModel);
    readonly harmfulEventFields = defineFields(this.harmfulEventSection, {
        harmfulEventFirst: { label: "First Harmful Event", ctor: OptionFieldModel },
        harmfulEventLocation: { label: "First Harmful Event Location", ctor: OptionFieldModel }
    });

    readonly junctionSection: SectionDefinition<JunctionSectionModel> = DefinitionFactory.section<JunctionSectionModel>("junction-section", this.collisionPage, JunctionSectionModel);
    readonly junctionFields = defineFields(this.junctionSection, {
        junctionRelation: { label: "Relation to Junction", ctor: OptionFieldModel },
        junctionContributingFactorFirst: { label: "Contributing Factor - Roadway/Environment 1", ctor: OptionFieldModel },
        junctionContributingFactorSecond: { label: "Contributing Factor - Roadway/Environment 2", ctor: OptionFieldModel },
        junctionSchoolBusRelated: { label: "School Bus Related", ctor: OptionFieldModel }
    });

    readonly workZoneSection: SectionDefinition<WorkZoneSectionModel> = DefinitionFactory.section<WorkZoneSectionModel>("work-zone-section", this.collisionPage, WorkZoneSectionModel);
    readonly workZoneFields = defineFields(this.workZoneSection, {
        workZoneRelated: { label: "Work Zone Related", ctor: OptionFieldModel },
        workZoneCrashLocation: { label: "Crash in Work Zone", ctor: OptionFieldModel },
        workZoneType: { label: "Type of Work Zone", ctor: OptionFieldModel },
        workZoneWorkerPresent: { label: "Worker Present", ctor: OptionFieldModel },
        workZoneLawEnforcement: { label: "Law Enforcement in Work Zone", ctor: OptionFieldModel }
    });

    readonly witnessSection: SectionDefinition<WitnessSectionModel> = DefinitionFactory.section<WitnessSectionModel>("witness-section", this.collisionPage, WitnessSectionModel);
    readonly witnessFields = defineFields(this.witnessSection, {
        witnessOneType: { label: "W/P", ctor: StringFieldModel },
        witnessOneFirstName: { label: "First Name", ctor: StringFieldModel },
        witnessOneMiddleInitial: { label: "MI", ctor: StringFieldModel },
        witnessOneLastName: { label: "Last Name", ctor: StringFieldModel },
        witnessOneAddress: { label: "Address", ctor: StringFieldModel },
        witnessOneCity: { label: "City", ctor: StringFieldModel },
        witnessOneState: { label: "State", ctor: OptionFieldModel },
        witnessOneZipCode: { label: "Zip Code", ctor: StringFieldModel },
        witnessOneTelephone: { label: "Telephone", ctor: StringFieldModel },
        witnessOnePropertyDamageAmount: { label: "Prop. Dmg. Amount", ctor: StringFieldModel },
        witnessOnePropertyDamageDescription: { label: "Prop. Dmg. Description", ctor: StringFieldModel },
        witnessTwoType: { label: "W/P", ctor: StringFieldModel },
        witnessTwoFirstName: { label: "First Name", ctor: StringFieldModel },
        witnessTwoMiddleInitial: { label: "MI", ctor: StringFieldModel },
        witnessTwoLastName: { label: "Last Name", ctor: StringFieldModel },
        witnessTwoAddress: { label: "Address", ctor: StringFieldModel },
        witnessTwoCity: { label: "City", ctor: StringFieldModel },
        witnessTwoState: { label: "State", ctor: OptionFieldModel },
        witnessTwoZipCode: { label: "Zip Code", ctor: StringFieldModel },
        witnessTwoTelephone: { label: "Telephone", ctor: StringFieldModel },
        witnessTwoPropertyDamageAmount: { label: "Prop. Dmg. Amount", ctor: StringFieldModel },
        witnessTwoPropertyDamageDescription: { label: "Prop. Dmg. Description", ctor: StringFieldModel },
        witnessThreeType: { label: "W/P", ctor: StringFieldModel },
        witnessThreeFirstName: { label: "First Name", ctor: StringFieldModel },
        witnessThreeMiddleInitial: { label: "MI", ctor: StringFieldModel },
        witnessThreeLastName: { label: "Last Name", ctor: StringFieldModel },
        witnessThreeAddress: { label: "Address", ctor: StringFieldModel },
        witnessThreeCity: { label: "City", ctor: StringFieldModel },
        witnessThreeState: { label: "State", ctor: OptionFieldModel },
        witnessThreeZipCode: { label: "Zip Code", ctor: StringFieldModel },
        witnessThreeTelephone: { label: "Telephone", ctor: StringFieldModel },
        witnessThreePropertyDamageAmount: { label: "Prop. Dmg. Amount", ctor: StringFieldModel },
        witnessThreePropertyDamageDescription: { label: "Prop. Dmg. Description", ctor: StringFieldModel }
    });

    readonly collisionOfficerSection: SectionDefinition<CollisionOfficerSectionModel> = DefinitionFactory.section<CollisionOfficerSectionModel>("collision-officer-section", this.collisionPage, CollisionOfficerSectionModel);
    readonly collisionOfficerFields = defineFields(this.collisionOfficerSection, {
        collisionOfficerName: { label: "Investigating Officer", ctor: StringFieldModel },
        collisionOfficerRank: { label: "Rank", ctor: StringFieldModel },
        collisionOfficerCjaNumber: { label: "CJA #", ctor: StringFieldModel },
        collisionOfficerJurisdiction: { label: "Jurisdiction Code / Name", ctor: StringFieldModel },
        collisionOfficerReviewerName: { label: "Reviewer's Name", ctor: StringFieldModel },
        collisionOfficerReviewerRank: { label: "Rank", ctor: StringFieldModel },
        collisionOfficerReviewDate: { label: "Review Date", ctor: StringFieldModel },
        collisionOfficerInternalAgency: { label: "Internal Agency", ctor: StringFieldModel }
    });

    readonly personPage: PageDefinition<PersonPageModel> = DefinitionFactory.page<PersonPageModel>("person-page", this.formDefinition, PersonPageModel);

    readonly personHeaderSection: SectionDefinition<PersonHeaderSectionModel> = DefinitionFactory.section<PersonHeaderSectionModel>("person-header-section", this.personPage, PersonHeaderSectionModel);
    readonly personHeaderFields = defineFields(this.personHeaderSection, {
        personHeaderPersonNumber: { label: "Person #", ctor: StringFieldModel },
        personHeaderUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        personHeaderPersonType: { label: "Person Type", ctor: OptionFieldModel },
        personHeaderCrashReportNumber: { label: "SCDPS Crash Report Number", ctor: StringFieldModel },
        // stamped once in PersonPageModel.initialize() so a person keeps the same id across every save
        personHeaderPersonId: { label: "Person Id", ctor: HiddenFieldModel }
    });

    readonly personSection: SectionDefinition<PersonSectionModel> = DefinitionFactory.section<PersonSectionModel>("person-section", this.personPage, PersonSectionModel);
    readonly personFields = defineFields(this.personSection, {
        personFirstName: { label: "First Name", ctor: StringFieldModel },
        personMiddleName: { label: "MI", ctor: StringFieldModel },
        personLastName: { label: "Last Name", ctor: StringFieldModel },
        personPhoneNumber: { label: "Phone Number", ctor: StringFieldModel },
        personContributedTo: { label: "Contributed To", ctor: OptionFieldModel },
        personDateOfBirth: { label: "Date of Birth", ctor: StringFieldModel },
        personAddress: { label: "Current Address (Number and Street)", ctor: StringFieldModel },
        personCity: { label: "City", ctor: StringFieldModel },
        personState: { label: "State", ctor: OptionFieldModel },
        personZipCode: { label: "Zip Code", ctor: StringFieldModel },
        personSex: { label: "Sex", ctor: OptionFieldModel },
        personRace: { label: "Race", ctor: StringFieldModel }
    });

    readonly driverLicenseSection: SectionDefinition<DriverLicenseSectionModel> = DefinitionFactory.section<DriverLicenseSectionModel>("driver-license-section", this.personPage, DriverLicenseSectionModel);
    readonly driverLicenseFields = defineFields(this.driverLicenseSection, {
        driverLicenseNumber: { label: "Driver License Number", ctor: StringFieldModel },
        driverLicenseState: { label: "State", ctor: OptionFieldModel },
        driverLicenseClass: { label: "DL Class", ctor: StringFieldModel },
        driverLicenseJurisdiction: { label: "DL Jurisdiction", ctor: OptionFieldModel }
    });

    readonly driverActionsSection: SectionDefinition<DriverActionsSectionModel> = DefinitionFactory.section<DriverActionsSectionModel>("driver-actions-section", this.personPage, DriverActionsSectionModel);
    readonly driverActionsFields = defineFields(this.driverActionsSection, {
        driverActionsDistraction: { label: "Driver Distraction", ctor: OptionFieldModel },
        driverActionsFirst: { label: "1st", ctor: OptionFieldModel },
        driverActionsSecond: { label: "2nd", ctor: OptionFieldModel },
        driverActionsThird: { label: "3rd", ctor: OptionFieldModel },
        driverActionsFourth: { label: "4th", ctor: OptionFieldModel }
    });

    readonly occupantSection: SectionDefinition<OccupantSectionModel> = DefinitionFactory.section<OccupantSectionModel>("occupant-section", this.personPage, OccupantSectionModel);
    readonly occupantFields = defineFields(this.occupantSection, {
        occupantSeatingLocation: { label: "Person Seating Location-SL", ctor: StringFieldModel },
        occupantEjection: { label: "Ejection", ctor: OptionFieldModel },
        occupantMedicalFacilityTransport: { label: "Transported To Medical Facility", ctor: OptionFieldModel },
        occupantHeadInjury: { label: "Motorcycle/Moped Head Injury-HI", ctor: OptionFieldModel },
        occupantAirBagDeployment: { label: "Air Bag Deployment-ABD", ctor: OptionFieldModel },
        occupantRestraintDevice: { label: "Restraint Device-RD", ctor: OptionFieldModel }
    });

    readonly nonMotoristSection: SectionDefinition<NonMotoristSectionModel> = DefinitionFactory.section<NonMotoristSectionModel>("non-motorist-section", this.personPage, NonMotoristSectionModel);
    readonly nonMotoristFields = defineFields(this.nonMotoristSection, {
        nonMotoristUnitType: { label: "Non-Motorist Unit Type", ctor: OptionFieldModel },
        nonMotoristDistraction: { label: "Non-Motorist Distraction", ctor: OptionFieldModel }
    });

    readonly injurySection: SectionDefinition<InjurySectionModel> = DefinitionFactory.section<InjurySectionModel>("injury-section", this.personPage, InjurySectionModel);
    readonly injuryFields = defineFields(this.injurySection, {
        injuryStatus: { label: "Injury Status", ctor: OptionFieldModel },
        injuryContributingActionFirst: { label: "1st", ctor: OptionFieldModel },
        injuryContributingActionSecond: { label: "2nd", ctor: OptionFieldModel },
        injuryActionPriorToImpact: { label: "Action Prior to Impact", ctor: OptionFieldModel }
    });

    readonly safetyEquipmentSection: SectionDefinition<SafetyEquipmentSectionModel> = DefinitionFactory.section<SafetyEquipmentSectionModel>("safety-equipment-section", this.personPage, SafetyEquipmentSectionModel);
    readonly safetyEquipmentFields = defineFields(this.safetyEquipmentSection, {
        safetyEquipmentHelmetUse: { label: "Helmet Use? (H)", ctor: OptionFieldModel },
        safetyEquipmentProtectivePadsUse: { label: "Protective Pads Use? (P)", ctor: OptionFieldModel },
        safetyEquipmentOtherProtectiveUse: { label: "Other Protective Safety Equipment Use? (O)", ctor: OptionFieldModel },
        safetyEquipmentReflectiveClothingUse: { label: "Reflective Clothing Use? (R)", ctor: OptionFieldModel },
        safetyEquipmentLightingUse: { label: "Lighting Use? (L)", ctor: OptionFieldModel },
        safetyEquipmentOtherPreventativeUse: { label: "Other Preventative Safety Equipment Use? (S)", ctor: OptionFieldModel }
    });

    readonly alcoholDrugsSection: SectionDefinition<AlcoholDrugsSectionModel> = DefinitionFactory.section<AlcoholDrugsSectionModel>("alcohol-drugs-section", this.personPage, AlcoholDrugsSectionModel);
    readonly alcoholDrugsFields = defineFields(this.alcoholDrugsSection, {
        alcoholDrugsSuspectedUse: { label: "Suspects Use of", ctor: OptionFieldModel },
        alcoholDrugsAlcoholTestStatus: { label: "Alcohol Test Status", ctor: OptionFieldModel },
        alcoholDrugsAlcoholTestType: { label: "Alcohol Test Type", ctor: OptionFieldModel },
        alcoholDrugsBloodAlcoholContent: { label: "BAC", ctor: StringFieldModel },
        alcoholDrugsDrugTestStatus: { label: "Drug Test Status", ctor: OptionFieldModel },
        alcoholDrugsDrugTestType: { label: "Drug Test Type", ctor: OptionFieldModel },
        alcoholDrugsDrugTestResult: { label: "Drug Test Result", ctor: OptionFieldModel }
    });

    readonly passengersSection: SectionDefinition<PassengersSectionModel> = DefinitionFactory.section<PassengersSectionModel>("passengers-section", this.personPage, PassengersSectionModel);
    readonly passengersFields = defineFields(this.passengersSection, {
        passengerOnePersonNumber: { label: "Person #", ctor: StringFieldModel },
        passengerOneUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        passengerOneNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        passengerOneDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        passengerOneInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        passengerOneSex: { label: "Sex", ctor: OptionFieldModel },
        passengerOneRace: { label: "Race", ctor: StringFieldModel },
        passengerOneSeatingLocation: { label: "SL", ctor: StringFieldModel },
        passengerOneEjection: { label: "EJECT", ctor: OptionFieldModel },
        passengerOneMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        passengerOneAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        passengerOneSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        passengerOneRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        passengerOneHeadInjury: { label: "HI", ctor: OptionFieldModel },
        passengerTwoPersonNumber: { label: "Person #", ctor: StringFieldModel },
        passengerTwoUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        passengerTwoNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        passengerTwoDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        passengerTwoInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        passengerTwoSex: { label: "Sex", ctor: OptionFieldModel },
        passengerTwoRace: { label: "Race", ctor: StringFieldModel },
        passengerTwoSeatingLocation: { label: "SL", ctor: StringFieldModel },
        passengerTwoEjection: { label: "EJECT", ctor: OptionFieldModel },
        passengerTwoMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        passengerTwoAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        passengerTwoSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        passengerTwoRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        passengerTwoHeadInjury: { label: "HI", ctor: OptionFieldModel },
        passengerThreePersonNumber: { label: "Person #", ctor: StringFieldModel },
        passengerThreeUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        passengerThreeNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        passengerThreeDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        passengerThreeInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        passengerThreeSex: { label: "Sex", ctor: OptionFieldModel },
        passengerThreeRace: { label: "Race", ctor: StringFieldModel },
        passengerThreeSeatingLocation: { label: "SL", ctor: StringFieldModel },
        passengerThreeEjection: { label: "EJECT", ctor: OptionFieldModel },
        passengerThreeMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        passengerThreeAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        passengerThreeSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        passengerThreeRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        passengerThreeHeadInjury: { label: "HI", ctor: OptionFieldModel },
        passengerFourPersonNumber: { label: "Person #", ctor: StringFieldModel },
        passengerFourUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        passengerFourNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        passengerFourDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        passengerFourInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        passengerFourSex: { label: "Sex", ctor: OptionFieldModel },
        passengerFourRace: { label: "Race", ctor: StringFieldModel },
        passengerFourSeatingLocation: { label: "SL", ctor: StringFieldModel },
        passengerFourEjection: { label: "EJECT", ctor: OptionFieldModel },
        passengerFourMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        passengerFourAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        passengerFourSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        passengerFourRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        passengerFourHeadInjury: { label: "HI", ctor: OptionFieldModel }
    });

    readonly personOfficerSection: SectionDefinition<PersonOfficerSectionModel> = DefinitionFactory.section<PersonOfficerSectionModel>("person-officer-section", this.personPage, PersonOfficerSectionModel);
    readonly personOfficerFields = defineFields(this.personOfficerSection, {
        personOfficerName: { label: "Investigating Officer", ctor: StringFieldModel },
        personOfficerRank: { label: "Rank", ctor: StringFieldModel },
        personOfficerCjaNumber: { label: "CJA #", ctor: StringFieldModel },
        personOfficerInternalAgency: { label: "Internal Agency", ctor: StringFieldModel }
    });

    readonly unitPage: PageDefinition<UnitPageModel> = DefinitionFactory.page<UnitPageModel>("unit-page", this.formDefinition, UnitPageModel);

    readonly unitHeaderSection: SectionDefinition<UnitHeaderSectionModel> = DefinitionFactory.section<UnitHeaderSectionModel>("unit-header-section", this.unitPage, UnitHeaderSectionModel);
    readonly unitHeaderFields = defineFields(this.unitHeaderSection, {
        unitHeaderUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        unitHeaderFr10Number: { label: "FR-10 #", ctor: StringFieldModel },
        unitHeaderCrashReportNumber: { label: "SCDPS Crash Report Number", ctor: StringFieldModel },
        // stamped once in UnitPageModel.initialize() so a unit keeps the same id across every save
        unitHeaderUnitId: { label: "Unit Id", ctor: HiddenFieldModel }
    });

    readonly vehicleSection: SectionDefinition<VehicleSectionModel> = DefinitionFactory.section<VehicleSectionModel>("vehicle-section", this.unitPage, VehicleSectionModel);
    readonly vehicleFields = defineFields(this.vehicleSection, {
        vehicleStatus: { label: "Unit Status", ctor: OptionFieldModel },
        vehiclePlateNumber: { label: "Vehicle Plate Number", ctor: StringFieldModel },
        vehicleState: { label: "State", ctor: OptionFieldModel },
        vehiclePlateExpires: { label: "Expires", ctor: StringFieldModel },
        vehicleIdentificationNumber: { label: "VIN", ctor: StringFieldModel },
        vehicleDamageExtent: { label: "Extent of Damage", ctor: OptionFieldModel },
        vehicleHitAndRun: { label: "Hit & Run", ctor: OptionFieldModel },
        vehicleYear: { label: "Year", ctor: NumberFieldModel },
        vehicleMake: { label: "Make", ctor: OptionFieldModel },
        vehicleModel: { label: "Model", ctor: OptionFieldModel },
        vehicleBodyType: { label: "Body Type", ctor: StringFieldModel },
        vehicleOccupantCount: { label: "# Occupants", ctor: NumberFieldModel }
    });

    readonly insuranceSection: SectionDefinition<InsuranceSectionModel> = DefinitionFactory.section<InsuranceSectionModel>("insurance-section", this.unitPage, InsuranceSectionModel);
    readonly insuranceFields = defineFields(this.insuranceSection, {
        insuranceCompany: { label: "Insurance Company (Driver)", ctor: StringFieldModel },
        insuranceCdlRequired: { label: "CDL Required", ctor: OptionFieldModel },
        insuranceTowed: { label: "Towed", ctor: OptionFieldModel },
        insuranceTowedBy: { label: "Towed By", ctor: StringFieldModel },
        insuranceEstimatedDamage: { label: "Est Damage", ctor: StringFieldModel }
    });

    readonly ownerSection: SectionDefinition<OwnerSectionModel> = DefinitionFactory.section<OwnerSectionModel>("owner-section", this.unitPage, OwnerSectionModel);
    readonly ownerFields = defineFields(this.ownerSection, {
        ownerFirstName: { label: "First Name", ctor: StringFieldModel },
        ownerMiddleName: { label: "MI", ctor: StringFieldModel },
        ownerLastName: { label: "Last Name", ctor: StringFieldModel },
        ownerAddress: { label: "Address", ctor: StringFieldModel },
        ownerCity: { label: "City", ctor: StringFieldModel },
        ownerState: { label: "State", ctor: OptionFieldModel },
        ownerZipCode: { label: "Zip Code", ctor: StringFieldModel },
        ownerDriverLicenseNumber: { label: "Driver License Number", ctor: StringFieldModel }
    });

    readonly travelSection: SectionDefinition<TravelSectionModel> = DefinitionFactory.section<TravelSectionModel>("travel-section", this.unitPage, TravelSectionModel);
    readonly travelFields = defineFields(this.travelSection, {
        travelDirection: { label: "Vehicle Traveling", ctor: OptionFieldModel },
        travelSpeedRelated: { label: "Speed Related", ctor: OptionFieldModel },
        travelEstimatedSpeed: { label: "Est Speed", ctor: StringFieldModel },
        travelSpeedLimit: { label: "Speed Limit", ctor: StringFieldModel }
    });

    readonly damageSection: SectionDefinition<DamageSectionModel> = DefinitionFactory.section<DamageSectionModel>("damage-section", this.unitPage, DamageSectionModel);
    readonly damageFields = defineFields(this.damageSection, {
        damageInitialPointOfContact: { label: "Initial Point of Contact", ctor: OptionFieldModel },
        damageAreaOne: { label: "1", ctor: OptionFieldModel },
        damageAreaTwo: { label: "2", ctor: OptionFieldModel },
        damageAreaThree: { label: "3", ctor: OptionFieldModel },
        damageAreaFour: { label: "4", ctor: OptionFieldModel },
        damageAreaFive: { label: "5", ctor: OptionFieldModel },
        damageAreaSix: { label: "6", ctor: OptionFieldModel },
        damageAreaSeven: { label: "7", ctor: OptionFieldModel },
        damageAreaEight: { label: "8", ctor: OptionFieldModel },
        damageAreaNine: { label: "9", ctor: OptionFieldModel },
        damageAreaTen: { label: "10", ctor: OptionFieldModel },
        damageAreaEleven: { label: "11", ctor: OptionFieldModel },
        damageAreaTwelve: { label: "12", ctor: OptionFieldModel }
    });

    readonly unitTypeSection: SectionDefinition<UnitTypeSectionModel> = DefinitionFactory.section<UnitTypeSectionModel>("unit-type-section", this.unitPage, UnitTypeSectionModel);
    readonly unitTypeFields = defineFields(this.unitTypeSection, {
        unitTypeUnit: { label: "Unit Type", ctor: OptionFieldModel },
        unitTypeEmergencyVehicleUse: { label: "Emergency Vehicle Use", ctor: OptionFieldModel },
        unitTypeSpecialFunction: { label: "Special Function of Motor Vehicle", ctor: OptionFieldModel }
    });

    readonly eventsSection: SectionDefinition<EventsSectionModel> = DefinitionFactory.section<EventsSectionModel>("events-section", this.unitPage, EventsSectionModel);
    readonly eventsFields = defineFields(this.eventsSection, {
        eventsMostHarmful: { label: "Most Harmful Event", ctor: OptionFieldModel },
        eventsSequenceFirst: { label: "1st", ctor: OptionFieldModel },
        eventsSequenceSecond: { label: "2nd", ctor: OptionFieldModel },
        eventsSequenceThird: { label: "3rd", ctor: OptionFieldModel },
        eventsSequenceFourth: { label: "4th", ctor: OptionFieldModel }
    });

    readonly roadwaySection: SectionDefinition<RoadwaySectionModel> = DefinitionFactory.section<RoadwaySectionModel>("roadway-section", this.unitPage, RoadwaySectionModel);
    readonly roadwayFields = defineFields(this.roadwaySection, {
        roadwayGrade: { label: "Roadway Grade", ctor: OptionFieldModel },
        roadwayAlignment: { label: "Alignment", ctor: OptionFieldModel },
        roadwayVehicleActionPriorToImpact: { label: "Vehicle Action Prior to Impact", ctor: OptionFieldModel },
        roadwayTrafficControlDeviceFirst: { label: "1st", ctor: OptionFieldModel },
        roadwayTrafficControlDeviceSecond: { label: "2nd", ctor: OptionFieldModel },
        roadwayTrafficControlDeviceThird: { label: "3rd", ctor: OptionFieldModel },
        roadwayTrafficControlDeviceFourth: { label: "4th", ctor: OptionFieldModel },
        roadwayVehicleContributingCircumstances: { label: "Vehicle Contributing Circumstances", ctor: OptionFieldModel }
    });

    readonly violationsSection: SectionDefinition<ViolationsSectionModel> = DefinitionFactory.section<ViolationsSectionModel>("violations-section", this.unitPage, ViolationsSectionModel);
    readonly violationsFields = defineFields(this.violationsSection, {
        violationOneStatuteNumber: { label: "SC Statute Number", ctor: StringFieldModel },
        violationOneCharge: { label: "Charge", ctor: StringFieldModel },
        violationOneTicketNumber: { label: "Ticket #", ctor: StringFieldModel },
        violationTwoStatuteNumber: { label: "SC Statute Number", ctor: StringFieldModel },
        violationTwoCharge: { label: "Charge", ctor: StringFieldModel },
        violationTwoTicketNumber: { label: "Ticket #", ctor: StringFieldModel }
    });

    readonly unitOfficerSection: SectionDefinition<UnitOfficerSectionModel> = DefinitionFactory.section<UnitOfficerSectionModel>("unit-officer-section", this.unitPage, UnitOfficerSectionModel);
    readonly unitOfficerFields = defineFields(this.unitOfficerSection, {
        unitOfficerName: { label: "Investigating Officer", ctor: StringFieldModel },
        unitOfficerRank: { label: "Rank", ctor: StringFieldModel },
        unitOfficerCjaNumber: { label: "CJA #", ctor: StringFieldModel },
        unitOfficerInternalAgency: { label: "Internal Agency", ctor: StringFieldModel }
    });

    readonly narrativePage: PageDefinition<NarrativePageModel> = DefinitionFactory.page<NarrativePageModel>("narrative-page", this.formDefinition, NarrativePageModel);

    readonly narrativeHeaderSection: SectionDefinition<NarrativeHeaderSectionModel> = DefinitionFactory.section<NarrativeHeaderSectionModel>("narrative-header-section", this.narrativePage, NarrativeHeaderSectionModel);
    readonly narrativeHeaderFields = defineFields(this.narrativeHeaderSection, {
        narrativeHeaderInternalAgencyCode: { label: "Internal Agency Code", ctor: StringFieldModel },
        narrativeHeaderCrashReportNumber: { label: "SCDPS Crash Report Number", ctor: StringFieldModel }
    });

    readonly narrativeSection: SectionDefinition<NarrativeSectionModel> = DefinitionFactory.section<NarrativeSectionModel>("narrative-section", this.narrativePage, NarrativeSectionModel);
    readonly narrativeFields = defineFields(this.narrativeSection, {
        narrativeText: { label: "Narrative", ctor: StringFieldModel },
        narrativeAmendedOrCorrectedNotes: { label: "Amended or Corrected Notes", ctor: StringFieldModel }
    });

    readonly diagramSection: SectionDefinition<DiagramSectionModel> = DefinitionFactory.section<DiagramSectionModel>("diagram-section", this.narrativePage, DiagramSectionModel);
    readonly diagramFields = defineFields(this.diagramSection, {
        diagramContent: { label: "Diagram", ctor: StringFieldModel }
    });

    readonly additionalPassengersSection: SectionDefinition<AdditionalPassengersSectionModel> = DefinitionFactory.section<AdditionalPassengersSectionModel>("additional-passengers-section", this.narrativePage, AdditionalPassengersSectionModel);
    readonly additionalPassengersFields = defineFields(this.additionalPassengersSection, {
        additionalPassengerOnePersonNumber: { label: "Person #", ctor: StringFieldModel },
        additionalPassengerOneUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        additionalPassengerOneNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        additionalPassengerOneDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        additionalPassengerOneInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        additionalPassengerOneSex: { label: "Sex", ctor: OptionFieldModel },
        additionalPassengerOneRace: { label: "Race", ctor: StringFieldModel },
        additionalPassengerOneSeatingLocation: { label: "SL", ctor: StringFieldModel },
        additionalPassengerOneEjection: { label: "EJECT", ctor: OptionFieldModel },
        additionalPassengerOneMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        additionalPassengerOneAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        additionalPassengerOneSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        additionalPassengerOneRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        additionalPassengerOneHeadInjury: { label: "HI", ctor: OptionFieldModel },
        additionalPassengerTwoPersonNumber: { label: "Person #", ctor: StringFieldModel },
        additionalPassengerTwoUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        additionalPassengerTwoNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        additionalPassengerTwoDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        additionalPassengerTwoInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        additionalPassengerTwoSex: { label: "Sex", ctor: OptionFieldModel },
        additionalPassengerTwoRace: { label: "Race", ctor: StringFieldModel },
        additionalPassengerTwoSeatingLocation: { label: "SL", ctor: StringFieldModel },
        additionalPassengerTwoEjection: { label: "EJECT", ctor: OptionFieldModel },
        additionalPassengerTwoMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        additionalPassengerTwoAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        additionalPassengerTwoSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        additionalPassengerTwoRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        additionalPassengerTwoHeadInjury: { label: "HI", ctor: OptionFieldModel },
        additionalPassengerThreePersonNumber: { label: "Person #", ctor: StringFieldModel },
        additionalPassengerThreeUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        additionalPassengerThreeNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        additionalPassengerThreeDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        additionalPassengerThreeInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        additionalPassengerThreeSex: { label: "Sex", ctor: OptionFieldModel },
        additionalPassengerThreeRace: { label: "Race", ctor: StringFieldModel },
        additionalPassengerThreeSeatingLocation: { label: "SL", ctor: StringFieldModel },
        additionalPassengerThreeEjection: { label: "EJECT", ctor: OptionFieldModel },
        additionalPassengerThreeMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        additionalPassengerThreeAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        additionalPassengerThreeSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        additionalPassengerThreeRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        additionalPassengerThreeHeadInjury: { label: "HI", ctor: OptionFieldModel },
        additionalPassengerFourPersonNumber: { label: "Person #", ctor: StringFieldModel },
        additionalPassengerFourUnitNumber: { label: "Unit #", ctor: StringFieldModel },
        additionalPassengerFourNameAndAddress: { label: "Name & Address", ctor: StringFieldModel },
        additionalPassengerFourDateOfBirth: { label: "DOB", ctor: StringFieldModel },
        additionalPassengerFourInjuryStatus: { label: "INJ", ctor: OptionFieldModel },
        additionalPassengerFourSex: { label: "Sex", ctor: OptionFieldModel },
        additionalPassengerFourRace: { label: "Race", ctor: StringFieldModel },
        additionalPassengerFourSeatingLocation: { label: "SL", ctor: StringFieldModel },
        additionalPassengerFourEjection: { label: "EJECT", ctor: OptionFieldModel },
        additionalPassengerFourMedicalFacilityTransport: { label: "TRANS", ctor: OptionFieldModel },
        additionalPassengerFourAirBagDeployment: { label: "ABD", ctor: OptionFieldModel },
        additionalPassengerFourSafetyEquipment: { label: "SE", ctor: OptionFieldModel },
        additionalPassengerFourRestraintDevice: { label: "RD", ctor: OptionFieldModel },
        additionalPassengerFourHeadInjury: { label: "HI", ctor: OptionFieldModel }
    });

    readonly narrativeOfficerSection: SectionDefinition<NarrativeOfficerSectionModel> = DefinitionFactory.section<NarrativeOfficerSectionModel>("narrative-officer-section", this.narrativePage, NarrativeOfficerSectionModel);
    readonly narrativeOfficerFields = defineFields(this.narrativeOfficerSection, {
        narrativeOfficerName: { label: "Investigating Officer", ctor: StringFieldModel },
        narrativeOfficerRank: { label: "Rank", ctor: StringFieldModel },
        narrativeOfficerCjaNumber: { label: "CJA #", ctor: StringFieldModel },
        narrativeOfficerInternalAgency: { label: "Internal Agency", ctor: StringFieldModel }
    });

    // declared last so that every field group above is initialized before the rules referencing them are built.
    readonly ruleCollection: RuleCollection = createRuleCollection(this);
}
