import { IValueListDefinition, toOptions } from "@forms/value-lists";

/**
 * The ids of the value lists this report owns, prefixed with the form since the registry is a single global
 * namespace and registering replaces whatever already held an id. An unqualified `county` would be claimed by
 * whichever form loaded last, silently showing the wrong counties.
 */
export const TR310ValueListId = {
    actionPriorToImpact: "sc-tr310:action-prior-to-impact",
    airBagDeployment: "sc-tr310:air-bag-deployment",
    alcoholTestType: "sc-tr310:alcohol-test-type",
    barrierType: "sc-tr310:barrier-type",
    cdlRequirement: "sc-tr310:cdl-requirement",
    contributingAction: "sc-tr310:contributing-action",
    county: "sc-tr310:county",
    damageArea: "sc-tr310:damage-area",
    damageExtent: "sc-tr310:damage-extent",
    driverAction: "sc-tr310:driver-action",
    driverDistraction: "sc-tr310:driver-distraction",
    drugTestResult: "sc-tr310:drug-test-result",
    drugTestType: "sc-tr310:drug-test-type",
    ejection: "sc-tr310:ejection",
    emergencyVehicleUse: "sc-tr310:emergency-vehicle-use",
    firstHarmfulEvent: "sc-tr310:first-harmful-event",
    firstHarmfulEventLocation: "sc-tr310:first-harmful-event-location",
    gender: "sc-tr310:gender",
    injuryStatus: "sc-tr310:injury-status",
    intersectionType: "sc-tr310:intersection-type",
    licenseJurisdiction: "sc-tr310:license-jurisdiction",
    lightCondition: "sc-tr310:light-condition",
    mannerOfCollision: "sc-tr310:manner-of-collision",
    medicalFacilityTransport: "sc-tr310:medical-facility-transport",
    nonMotoristDistraction: "sc-tr310:non-motorist-distraction",
    nonMotoristUnitType: "sc-tr310:non-motorist-unit-type",
    personType: "sc-tr310:person-type",
    relationToJunction: "sc-tr310:relation-to-junction",
    restraintDevice: "sc-tr310:restraint-device",
    roadSurfaceCondition: "sc-tr310:road-surface-condition",
    roadwayAlignment: "sc-tr310:roadway-alignment",
    roadwayContributingFactor: "sc-tr310:roadway-contributing-factor",
    roadwayGrade: "sc-tr310:roadway-grade",
    safetyEquipmentUse: "sc-tr310:safety-equipment-use",
    schoolBusRelation: "sc-tr310:school-bus-relation",
    sequenceOfEvents: "sc-tr310:sequence-of-events",
    specialFunction: "sc-tr310:special-function",
    speedRelation: "sc-tr310:speed-relation",
    suspectedSubstanceUse: "sc-tr310:suspected-substance-use",
    testStatus: "sc-tr310:test-status",
    towStatus: "sc-tr310:tow-status",
    trafficControlDevice: "sc-tr310:traffic-control-device",
    trafficwayDirection: "sc-tr310:trafficway-direction",
    trafficwayDivision: "sc-tr310:trafficway-division",
    travelDirection: "sc-tr310:travel-direction",
    unitStatus: "sc-tr310:unit-status",
    unitType: "sc-tr310:unit-type",
    vehicleActionPriorToImpact: "sc-tr310:vehicle-action-prior-to-impact",
    vehicleContributingCircumstance: "sc-tr310:vehicle-contributing-circumstance",
    weatherCondition: "sc-tr310:weather-condition",
    workZoneCrashLocation: "sc-tr310:work-zone-crash-location",
    workZonePresence: "sc-tr310:work-zone-presence",
    workZoneType: "sc-tr310:work-zone-type",
    yesNo: "sc-tr310:yes-no",
    yesNoUnknown: "sc-tr310:yes-no-unknown"
} as const;

/**
 * The value lists this report registers with the value list service.
 *
 * These belong to this form rather than every form: the code sets the TR-310 prints beside its own boxes, plus
 * South Carolina's counties. States, vehicle makes and models come from `@forms/value-lists` instead.
 *
 * Every generated module must stay reached only through a dynamic `load()` -- a static import under ./generated,
 * even a type-only one a later edit turns into a value import, folds that data back into this module's own chunk
 * and silently breaks the split. A report with fifty-odd code sets has a lot to keep out of its entry chunk.
 *
 * Several boxes share a list where the form prints the same legend twice: worker-present and law-enforcement
 * both take `workZonePresence`; alcohol and drug test status both take `testStatus`.
 */
export const tr310ValueLists: ReadonlyArray<IValueListDefinition> = [
    {
        id: TR310ValueListId.actionPriorToImpact,
        load: () => import("./generated/actions-prior-to-impact").then(module => toOptions(module.actionsPriorToImpact))
    },
    {
        id: TR310ValueListId.airBagDeployment,
        load: () => import("./generated/air-bag-deployments").then(module => toOptions(module.airBagDeployments))
    },
    {
        id: TR310ValueListId.alcoholTestType,
        load: () => import("./generated/alcohol-test-types").then(module => toOptions(module.alcoholTestTypes))
    },
    {
        id: TR310ValueListId.barrierType,
        load: () => import("./generated/barrier-types").then(module => toOptions(module.barrierTypes))
    },
    {
        id: TR310ValueListId.cdlRequirement,
        load: () => import("./generated/cdl-requirements").then(module => toOptions(module.cdlRequirements))
    },
    {
        id: TR310ValueListId.contributingAction,
        load: () => import("./generated/contributing-actions").then(module => toOptions(module.contributingActions))
    },
    {
        id: TR310ValueListId.county,
        load: () => import("./generated/counties").then(module => toOptions(module.counties))
    },
    {
        id: TR310ValueListId.damageArea,
        load: () => import("./generated/damage-areas").then(module => toOptions(module.damageAreas))
    },
    {
        id: TR310ValueListId.damageExtent,
        load: () => import("./generated/damage-extents").then(module => toOptions(module.damageExtents))
    },
    {
        id: TR310ValueListId.driverAction,
        load: () => import("./generated/driver-actions").then(module => toOptions(module.driverActions))
    },
    {
        id: TR310ValueListId.driverDistraction,
        load: () => import("./generated/driver-distractions").then(module => toOptions(module.driverDistractions))
    },
    {
        id: TR310ValueListId.drugTestResult,
        load: () => import("./generated/drug-test-results").then(module => toOptions(module.drugTestResults))
    },
    {
        id: TR310ValueListId.drugTestType,
        load: () => import("./generated/drug-test-types").then(module => toOptions(module.drugTestTypes))
    },
    {
        id: TR310ValueListId.ejection,
        load: () => import("./generated/ejections").then(module => toOptions(module.ejections))
    },
    {
        id: TR310ValueListId.emergencyVehicleUse,
        load: () => import("./generated/emergency-vehicle-uses").then(module => toOptions(module.emergencyVehicleUses))
    },
    {
        id: TR310ValueListId.firstHarmfulEvent,
        load: () => import("./generated/first-harmful-events").then(module => toOptions(module.firstHarmfulEvents))
    },
    {
        id: TR310ValueListId.firstHarmfulEventLocation,
        load: () => import("./generated/first-harmful-event-locations").then(module => toOptions(module.firstHarmfulEventLocations))
    },
    {
        id: TR310ValueListId.gender,
        load: () => import("./generated/genders").then(module => toOptions(module.genders))
    },
    {
        id: TR310ValueListId.injuryStatus,
        load: () => import("./generated/injury-statuses").then(module => toOptions(module.injuryStatuses))
    },
    {
        id: TR310ValueListId.intersectionType,
        load: () => import("./generated/intersection-types").then(module => toOptions(module.intersectionTypes))
    },
    {
        id: TR310ValueListId.licenseJurisdiction,
        load: () => import("./generated/license-jurisdictions").then(module => toOptions(module.licenseJurisdictions))
    },
    {
        id: TR310ValueListId.lightCondition,
        load: () => import("./generated/light-conditions").then(module => toOptions(module.lightConditions))
    },
    {
        id: TR310ValueListId.mannerOfCollision,
        load: () => import("./generated/manners-of-collision").then(module => toOptions(module.mannersOfCollision))
    },
    {
        id: TR310ValueListId.medicalFacilityTransport,
        load: () => import("./generated/medical-facility-transports").then(module => toOptions(module.medicalFacilityTransports))
    },
    {
        id: TR310ValueListId.nonMotoristDistraction,
        load: () => import("./generated/non-motorist-distractions").then(module => toOptions(module.nonMotoristDistractions))
    },
    {
        id: TR310ValueListId.nonMotoristUnitType,
        load: () => import("./generated/non-motorist-unit-types").then(module => toOptions(module.nonMotoristUnitTypes))
    },
    {
        id: TR310ValueListId.personType,
        load: () => import("./generated/person-types").then(module => toOptions(module.personTypes))
    },
    {
        id: TR310ValueListId.relationToJunction,
        load: () => import("./generated/relations-to-junction").then(module => toOptions(module.relationsToJunction))
    },
    {
        id: TR310ValueListId.restraintDevice,
        load: () => import("./generated/restraint-devices").then(module => toOptions(module.restraintDevices))
    },
    {
        id: TR310ValueListId.roadSurfaceCondition,
        load: () => import("./generated/road-surface-conditions").then(module => toOptions(module.roadSurfaceConditions))
    },
    {
        id: TR310ValueListId.roadwayAlignment,
        load: () => import("./generated/roadway-alignments").then(module => toOptions(module.roadwayAlignments))
    },
    {
        id: TR310ValueListId.roadwayContributingFactor,
        load: () => import("./generated/roadway-contributing-factors").then(module => toOptions(module.roadwayContributingFactors))
    },
    {
        id: TR310ValueListId.roadwayGrade,
        load: () => import("./generated/roadway-grades").then(module => toOptions(module.roadwayGrades))
    },
    {
        id: TR310ValueListId.safetyEquipmentUse,
        load: () => import("./generated/safety-equipment-uses").then(module => toOptions(module.safetyEquipmentUses))
    },
    {
        id: TR310ValueListId.schoolBusRelation,
        load: () => import("./generated/school-bus-relations").then(module => toOptions(module.schoolBusRelations))
    },
    {
        id: TR310ValueListId.sequenceOfEvents,
        load: () => import("./generated/sequence-of-events").then(module => toOptions(module.sequenceOfEvents))
    },
    {
        id: TR310ValueListId.specialFunction,
        load: () => import("./generated/special-functions").then(module => toOptions(module.specialFunctions))
    },
    {
        id: TR310ValueListId.speedRelation,
        load: () => import("./generated/speed-relations").then(module => toOptions(module.speedRelations))
    },
    {
        id: TR310ValueListId.suspectedSubstanceUse,
        load: () => import("./generated/suspected-substance-uses").then(module => toOptions(module.suspectedSubstanceUses))
    },
    {
        id: TR310ValueListId.testStatus,
        load: () => import("./generated/test-statuses").then(module => toOptions(module.testStatuses))
    },
    {
        id: TR310ValueListId.towStatus,
        load: () => import("./generated/tow-statuses").then(module => toOptions(module.towStatuses))
    },
    {
        id: TR310ValueListId.trafficControlDevice,
        load: () => import("./generated/traffic-control-devices").then(module => toOptions(module.trafficControlDevices))
    },
    {
        id: TR310ValueListId.trafficwayDirection,
        load: () => import("./generated/trafficway-directions").then(module => toOptions(module.trafficwayDirections))
    },
    {
        id: TR310ValueListId.trafficwayDivision,
        load: () => import("./generated/trafficway-divisions").then(module => toOptions(module.trafficwayDivisions))
    },
    {
        id: TR310ValueListId.travelDirection,
        load: () => import("./generated/travel-directions").then(module => toOptions(module.travelDirections))
    },
    {
        id: TR310ValueListId.unitStatus,
        load: () => import("./generated/unit-statuses").then(module => toOptions(module.unitStatuses))
    },
    {
        id: TR310ValueListId.unitType,
        load: () => import("./generated/unit-types").then(module => toOptions(module.unitTypes))
    },
    {
        id: TR310ValueListId.vehicleActionPriorToImpact,
        load: () => import("./generated/vehicle-actions-prior-to-impact").then(module => toOptions(module.vehicleActionsPriorToImpact))
    },
    {
        id: TR310ValueListId.vehicleContributingCircumstance,
        load: () => import("./generated/vehicle-contributing-circumstances").then(module => toOptions(module.vehicleContributingCircumstances))
    },
    {
        id: TR310ValueListId.weatherCondition,
        load: () => import("./generated/weather-conditions").then(module => toOptions(module.weatherConditions))
    },
    {
        id: TR310ValueListId.workZoneCrashLocation,
        load: () => import("./generated/work-zone-crash-locations").then(module => toOptions(module.workZoneCrashLocations))
    },
    {
        id: TR310ValueListId.workZonePresence,
        load: () => import("./generated/work-zone-presences").then(module => toOptions(module.workZonePresences))
    },
    {
        id: TR310ValueListId.workZoneType,
        load: () => import("./generated/work-zone-types").then(module => toOptions(module.workZoneTypes))
    },
    {
        id: TR310ValueListId.yesNo,
        load: () => import("./generated/yes-no").then(module => toOptions(module.yesNo))
    },
    {
        id: TR310ValueListId.yesNoUnknown,
        load: () => import("./generated/yes-no-unknown").then(module => toOptions(module.yesNoUnknown))
    }
];
