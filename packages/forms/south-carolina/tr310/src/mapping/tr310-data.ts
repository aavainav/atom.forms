import { IOptionValue } from "@forms/core";

/** Represents one passenger row, shared by the person page's passenger rows and the narrative page's additional passenger rows. */
export interface ITR310PassengerData {
    /** "ABD" */
    readonly airBagDeployment?: IOptionValue;
    /** "DOB" */
    readonly dateOfBirth?: string;
    /** "EJECT" */
    readonly ejection?: IOptionValue;
    /** "HI" */
    readonly headInjury?: IOptionValue;
    /** "INJ" */
    readonly injuryStatus?: IOptionValue;
    /** "TRANS" */
    readonly medicalFacilityTransport?: IOptionValue;
    /** "Name & Address" */
    readonly nameAndAddress?: string;
    /** "Person #" */
    readonly personNumber?: string;
    /** "Race" */
    readonly race?: string;
    /** "RD" */
    readonly restraintDevice?: IOptionValue;
    /** "SE" */
    readonly safetyEquipment?: IOptionValue;
    /** "SL" */
    readonly seatingLocation?: string;
    /** "Sex" */
    readonly sex?: IOptionValue;
    /** "Unit #" */
    readonly unitNumber?: string;
}

/** Represents one person page of the report - a driver or a non-motorist, together with the passengers riding with them. */
export interface ITR310PersonData {
    /** "Alcohol Test Status", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsAlcoholTestStatus?: IOptionValue;
    /** "Alcohol Test Type", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsAlcoholTestType?: IOptionValue;
    /** "BAC", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsBloodAlcoholContent?: string;
    /** "Drug Test Result", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsDrugTestResult?: IOptionValue;
    /** "Drug Test Status", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsDrugTestStatus?: IOptionValue;
    /** "Drug Test Type", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsDrugTestType?: IOptionValue;
    /** "Suspects Use of", from the alcohol drugs section of the person page. */
    readonly alcoholDrugsSuspectedUse?: IOptionValue;
    /** "Driver Distraction", from the driver actions section of the person page. */
    readonly driverActionsDistraction?: IOptionValue;
    /** "1st", from the driver actions section of the person page. */
    readonly driverActionsFirst?: IOptionValue;
    /** "4th", from the driver actions section of the person page. */
    readonly driverActionsFourth?: IOptionValue;
    /** "2nd", from the driver actions section of the person page. */
    readonly driverActionsSecond?: IOptionValue;
    /** "3rd", from the driver actions section of the person page. */
    readonly driverActionsThird?: IOptionValue;
    /** "DL Class", from the driver license section of the person page. */
    readonly driverLicenseClass?: string;
    /** "DL Jurisdiction", from the driver license section of the person page. */
    readonly driverLicenseJurisdiction?: IOptionValue;
    /** "Driver License Number", from the driver license section of the person page. */
    readonly driverLicenseNumber?: string;
    /** "State", from the driver license section of the person page. */
    readonly driverLicenseState?: IOptionValue;
    /** "Action Prior to Impact", from the injury section of the person page. */
    readonly injuryActionPriorToImpact?: IOptionValue;
    /** "1st", from the injury section of the person page. */
    readonly injuryContributingActionFirst?: IOptionValue;
    /** "2nd", from the injury section of the person page. */
    readonly injuryContributingActionSecond?: IOptionValue;
    /** "Injury Status", from the injury section of the person page. */
    readonly injuryStatus?: IOptionValue;
    /** "Non-Motorist Distraction", from the non motorist section of the person page. */
    readonly nonMotoristDistraction?: IOptionValue;
    /** "Non-Motorist Unit Type", from the non motorist section of the person page. */
    readonly nonMotoristUnitType?: IOptionValue;
    /** "Air Bag Deployment-ABD", from the occupant section of the person page. */
    readonly occupantAirBagDeployment?: IOptionValue;
    /** "Ejection", from the occupant section of the person page. */
    readonly occupantEjection?: IOptionValue;
    /** "Motorcycle/Moped Head Injury-HI", from the occupant section of the person page. */
    readonly occupantHeadInjury?: IOptionValue;
    /** "Transported To Medical Facility", from the occupant section of the person page. */
    readonly occupantMedicalFacilityTransport?: IOptionValue;
    /** "Restraint Device-RD", from the occupant section of the person page. */
    readonly occupantRestraintDevice?: IOptionValue;
    /** "Person Seating Location-SL", from the occupant section of the person page. */
    readonly occupantSeatingLocation?: string;
    /** One entry per passenger row on the person page (always four, blank rows included). A row the data omits, when populating, is left as it stands. */
    readonly passengers?: ReadonlyArray<ITR310PassengerData>;
    /** "Current Address (Number and Street)", from the person section of the person page. */
    readonly personAddress?: string;
    /** "City", from the person section of the person page. */
    readonly personCity?: string;
    /** "Contributed To", from the person section of the person page. */
    readonly personContributedTo?: IOptionValue;
    /** "Date of Birth", from the person section of the person page. */
    readonly personDateOfBirth?: string;
    /** "First Name", from the person section of the person page. */
    readonly personFirstName?: string;
    /** "SCDPS Crash Report Number", from the person header section of the person page. */
    readonly personHeaderCrashReportNumber?: string;
    /** Identifies this person page across saves. From the person header section, but hidden -- not printed, and not the "Person #" the officer writes. */
    readonly personHeaderPersonId?: string;
    /** "Person #", from the person header section of the person page. */
    readonly personHeaderPersonNumber?: string;
    /** "Person Type", from the person header section of the person page. */
    readonly personHeaderPersonType?: IOptionValue;
    /** "Unit #", from the person header section of the person page. */
    readonly personHeaderUnitNumber?: string;
    /** "Last Name", from the person section of the person page. */
    readonly personLastName?: string;
    /** "MI", from the person section of the person page. */
    readonly personMiddleName?: string;
    /** "CJA #", from the person officer section of the person page. */
    readonly personOfficerCjaNumber?: string;
    /** "Internal Agency", from the person officer section of the person page. */
    readonly personOfficerInternalAgency?: string;
    /** "Investigating Officer", from the person officer section of the person page. */
    readonly personOfficerName?: string;
    /** "Rank", from the person officer section of the person page. */
    readonly personOfficerRank?: string;
    /** "Phone Number", from the person section of the person page. */
    readonly personPhoneNumber?: string;
    /** "Race", from the person section of the person page. */
    readonly personRace?: string;
    /** "Sex", from the person section of the person page. */
    readonly personSex?: IOptionValue;
    /** "State", from the person section of the person page. */
    readonly personState?: IOptionValue;
    /** "Zip Code", from the person section of the person page. */
    readonly personZipCode?: string;
    /** "Helmet Use? (H)", from the safety equipment section of the person page. */
    readonly safetyEquipmentHelmetUse?: IOptionValue;
    /** "Lighting Use? (L)", from the safety equipment section of the person page. */
    readonly safetyEquipmentLightingUse?: IOptionValue;
    /** "Other Preventative Safety Equipment Use? (S)", from the safety equipment section of the person page. */
    readonly safetyEquipmentOtherPreventativeUse?: IOptionValue;
    /** "Other Protective Safety Equipment Use? (O)", from the safety equipment section of the person page. */
    readonly safetyEquipmentOtherProtectiveUse?: IOptionValue;
    /** "Protective Pads Use? (P)", from the safety equipment section of the person page. */
    readonly safetyEquipmentProtectivePadsUse?: IOptionValue;
    /** "Reflective Clothing Use? (R)", from the safety equipment section of the person page. */
    readonly safetyEquipmentReflectiveClothingUse?: IOptionValue;
}

/** Represents one unit page of the report - a vehicle involved in the collision, its owner, and what it was doing. */
export interface ITR310UnitData {
    /** "8", from the damage section of the unit page. */
    readonly damageAreaEight?: IOptionValue;
    /** "11", from the damage section of the unit page. */
    readonly damageAreaEleven?: IOptionValue;
    /** "5", from the damage section of the unit page. */
    readonly damageAreaFive?: IOptionValue;
    /** "4", from the damage section of the unit page. */
    readonly damageAreaFour?: IOptionValue;
    /** "9", from the damage section of the unit page. */
    readonly damageAreaNine?: IOptionValue;
    /** "1", from the damage section of the unit page. */
    readonly damageAreaOne?: IOptionValue;
    /** "7", from the damage section of the unit page. */
    readonly damageAreaSeven?: IOptionValue;
    /** "6", from the damage section of the unit page. */
    readonly damageAreaSix?: IOptionValue;
    /** "10", from the damage section of the unit page. */
    readonly damageAreaTen?: IOptionValue;
    /** "3", from the damage section of the unit page. */
    readonly damageAreaThree?: IOptionValue;
    /** "12", from the damage section of the unit page. */
    readonly damageAreaTwelve?: IOptionValue;
    /** "2", from the damage section of the unit page. */
    readonly damageAreaTwo?: IOptionValue;
    /** "Initial Point of Contact", from the damage section of the unit page. */
    readonly damageInitialPointOfContact?: IOptionValue;
    /** "Most Harmful Event", from the events section of the unit page. */
    readonly eventsMostHarmful?: IOptionValue;
    /** "1st", from the events section of the unit page. */
    readonly eventsSequenceFirst?: IOptionValue;
    /** "4th", from the events section of the unit page. */
    readonly eventsSequenceFourth?: IOptionValue;
    /** "2nd", from the events section of the unit page. */
    readonly eventsSequenceSecond?: IOptionValue;
    /** "3rd", from the events section of the unit page. */
    readonly eventsSequenceThird?: IOptionValue;
    /** "CDL Required", from the insurance section of the unit page. */
    readonly insuranceCdlRequired?: IOptionValue;
    /** "Insurance Company (Driver)", from the insurance section of the unit page. */
    readonly insuranceCompany?: string;
    /** "Est Damage", from the insurance section of the unit page. */
    readonly insuranceEstimatedDamage?: string;
    /** "Towed", from the insurance section of the unit page. */
    readonly insuranceTowed?: IOptionValue;
    /** "Towed By", from the insurance section of the unit page. */
    readonly insuranceTowedBy?: string;
    /** "Address", from the owner section of the unit page. */
    readonly ownerAddress?: string;
    /** "City", from the owner section of the unit page. */
    readonly ownerCity?: string;
    /** "Driver License Number", from the owner section of the unit page. */
    readonly ownerDriverLicenseNumber?: string;
    /** "First Name", from the owner section of the unit page. */
    readonly ownerFirstName?: string;
    /** "Last Name", from the owner section of the unit page. */
    readonly ownerLastName?: string;
    /** "MI", from the owner section of the unit page. */
    readonly ownerMiddleName?: string;
    /** "State", from the owner section of the unit page. */
    readonly ownerState?: IOptionValue;
    /** "Zip Code", from the owner section of the unit page. */
    readonly ownerZipCode?: string;
    /** "Alignment", from the roadway section of the unit page. */
    readonly roadwayAlignment?: IOptionValue;
    /** "Roadway Grade", from the roadway section of the unit page. */
    readonly roadwayGrade?: IOptionValue;
    /** "1st", from the roadway section of the unit page. */
    readonly roadwayTrafficControlDeviceFirst?: IOptionValue;
    /** "4th", from the roadway section of the unit page. */
    readonly roadwayTrafficControlDeviceFourth?: IOptionValue;
    /** "2nd", from the roadway section of the unit page. */
    readonly roadwayTrafficControlDeviceSecond?: IOptionValue;
    /** "3rd", from the roadway section of the unit page. */
    readonly roadwayTrafficControlDeviceThird?: IOptionValue;
    /** "Vehicle Action Prior to Impact", from the roadway section of the unit page. */
    readonly roadwayVehicleActionPriorToImpact?: IOptionValue;
    /** "Vehicle Contributing Circumstances", from the roadway section of the unit page. */
    readonly roadwayVehicleContributingCircumstances?: IOptionValue;
    /** "Vehicle Traveling", from the travel section of the unit page. */
    readonly travelDirection?: IOptionValue;
    /** "Est Speed", from the travel section of the unit page. */
    readonly travelEstimatedSpeed?: string;
    /** "Speed Limit", from the travel section of the unit page. */
    readonly travelSpeedLimit?: string;
    /** "Speed Related", from the travel section of the unit page. */
    readonly travelSpeedRelated?: IOptionValue;
    /** "SCDPS Crash Report Number", from the unit header section of the unit page. */
    readonly unitHeaderCrashReportNumber?: string;
    /** "FR-10 #", from the unit header section of the unit page. */
    readonly unitHeaderFr10Number?: string;
    /** Identifies this unit page across saves. From the unit header section, but hidden -- not printed, and not the "Unit #" the officer writes. */
    readonly unitHeaderUnitId?: string;
    /** "Unit #", from the unit header section of the unit page. */
    readonly unitHeaderUnitNumber?: string;
    /** "CJA #", from the unit officer section of the unit page. */
    readonly unitOfficerCjaNumber?: string;
    /** "Internal Agency", from the unit officer section of the unit page. */
    readonly unitOfficerInternalAgency?: string;
    /** "Investigating Officer", from the unit officer section of the unit page. */
    readonly unitOfficerName?: string;
    /** "Rank", from the unit officer section of the unit page. */
    readonly unitOfficerRank?: string;
    /** "Emergency Vehicle Use", from the unit type section of the unit page. */
    readonly unitTypeEmergencyVehicleUse?: IOptionValue;
    /** "Special Function of Motor Vehicle", from the unit type section of the unit page. */
    readonly unitTypeSpecialFunction?: IOptionValue;
    /** "Unit Type", from the unit type section of the unit page. */
    readonly unitTypeUnit?: IOptionValue;
    /** "Body Type", from the vehicle section of the unit page. */
    readonly vehicleBodyType?: string;
    /** "Extent of Damage", from the vehicle section of the unit page. */
    readonly vehicleDamageExtent?: IOptionValue;
    /** "Hit & Run", from the vehicle section of the unit page. */
    readonly vehicleHitAndRun?: IOptionValue;
    /** "VIN", from the vehicle section of the unit page. */
    readonly vehicleIdentificationNumber?: string;
    /** "Make", from the vehicle section of the unit page. */
    readonly vehicleMake?: IOptionValue;
    /** "Model", from the vehicle section of the unit page. */
    readonly vehicleModel?: IOptionValue;
    /** "# Occupants", from the vehicle section of the unit page. */
    readonly vehicleOccupantCount?: number;
    /** "Expires", from the vehicle section of the unit page. */
    readonly vehiclePlateExpires?: string;
    /** "Vehicle Plate Number", from the vehicle section of the unit page. */
    readonly vehiclePlateNumber?: string;
    /** "State", from the vehicle section of the unit page. */
    readonly vehicleState?: IOptionValue;
    /** "Unit Status", from the vehicle section of the unit page. */
    readonly vehicleStatus?: IOptionValue;
    /** "Year", from the vehicle section of the unit page. */
    readonly vehicleYear?: number;
    /** "Charge", from the violations section of the unit page. */
    readonly violationOneCharge?: string;
    /** "SC Statute Number", from the violations section of the unit page. */
    readonly violationOneStatuteNumber?: string;
    /** "Ticket #", from the violations section of the unit page. */
    readonly violationOneTicketNumber?: string;
    /** "Charge", from the violations section of the unit page. */
    readonly violationTwoCharge?: string;
    /** "SC Statute Number", from the violations section of the unit page. */
    readonly violationTwoStatuteNumber?: string;
    /** "Ticket #", from the violations section of the unit page. */
    readonly violationTwoTicketNumber?: string;
}

/** Represents one witness or property owner row, on the collision page. */
export interface ITR310WitnessData {
    /** "W/P" */
    readonly type?: string;
    /** "First Name" */
    readonly firstName?: string;
    /** "MI" */
    readonly middleInitial?: string;
    /** "Last Name" */
    readonly lastName?: string;
    /** "Address" */
    readonly address?: string;
    /** "City" */
    readonly city?: string;
    /** "State" */
    readonly state?: IOptionValue;
    /** "Zip Code" */
    readonly zipCode?: string;
    /** "Telephone" */
    readonly telephone?: string;
    /** "Prop. Dmg. Amount" */
    readonly propertyDamageAmount?: string;
    /** "Prop. Dmg. Description" */
    readonly propertyDamageDescription?: string;
}

/**
 * Represents the data contract for the SC TR-310 traffic collision report.
 *
 * The collision and the narrative appear once and so are carried flat; the people and the units appear once
 * each per page the report holds, and are carried as arrays in page order.
 */
export interface ITR310Data {
    /** "Type of Intersection", from the barrier section of the collision page. */
    readonly barrierIntersectionType?: IOptionValue;
    /** "Barrier Type", from the barrier section of the collision page. */
    readonly barrierType?: IOptionValue;
    /** "Auxiliary", from the base intersection section of the collision page. */
    readonly baseIntersectionAuxiliary?: string;
    /** "Category", from the base intersection section of the collision page. */
    readonly baseIntersectionCategory?: string;
    /** "Route Name", from the base intersection section of the collision page. */
    readonly baseIntersectionRouteName?: string;
    /** "Route #", from the base intersection section of the collision page. */
    readonly baseIntersectionRouteNumber?: string;
    /** "In City/Town Name", from the collision section of the collision page. */
    readonly collisionCityOrTown?: string;
    /** "County", from the collision section of the collision page. */
    readonly collisionCounty?: IOptionValue;
    /** "Date", from the collision section of the collision page. */
    readonly collisionDate?: string;
    /** "CJA #", from the collision officer section of the collision page. */
    readonly collisionOfficerCjaNumber?: string;
    /** "Internal Agency", from the collision officer section of the collision page. */
    readonly collisionOfficerInternalAgency?: string;
    /** "Jurisdiction Code / Name", from the collision officer section of the collision page. */
    readonly collisionOfficerJurisdiction?: string;
    /** "Investigating Officer", from the collision officer section of the collision page. */
    readonly collisionOfficerName?: string;
    /** "Rank", from the collision officer section of the collision page. */
    readonly collisionOfficerRank?: string;
    /** "Review Date", from the collision officer section of the collision page. */
    readonly collisionOfficerReviewDate?: string;
    /** "Reviewer's Name", from the collision officer section of the collision page. */
    readonly collisionOfficerReviewerName?: string;
    /** "Rank", from the collision officer section of the collision page. */
    readonly collisionOfficerReviewerRank?: string;
    /** "Crash Information (Check if Pictures Taken)", from the collision section of the collision page. */
    readonly collisionPicturesTaken?: boolean;
    /** "Private Property Collison", from the collision section of the collision page. */
    readonly collisionPrivatePropertyCollision?: IOptionValue;
    /** "Secondary Crash?", from the collision section of the collision page. */
    readonly collisionSecondaryCrash?: IOptionValue;
    /** "Time", from the collision section of the collision page. */
    readonly collisionTime?: string;
    /** "Total Damage in Collision $1000 or More", from the collision section of the collision page. */
    readonly collisionTotalDamageOverThreshold?: IOptionValue;
    /** "Light Condition", from the conditions section of the collision page. */
    readonly conditionsLight?: IOptionValue;
    /** "Manner of Collision", from the conditions section of the collision page. */
    readonly conditionsMannerOfCollision?: IOptionValue;
    /** "Road Surface Condition", from the conditions section of the collision page. */
    readonly conditionsRoadSurface?: IOptionValue;
    /** "Weather Condition 1", from the conditions section of the collision page. */
    readonly conditionsWeatherFirst?: IOptionValue;
    /** "Weather Condition 2", from the conditions section of the collision page. */
    readonly conditionsWeatherSecond?: IOptionValue;
    /** Latitude, from the coordinates section of the collision page. */
    readonly coordinatesLatitude?: string;
    /** Longitude, from the coordinates section of the collision page. */
    readonly coordinatesLongitude?: string;
    /** "Diagram", from the diagram section of the narrative page. */
    readonly diagramContent?: string;
    /** "First Harmful Event", from the harmful event section of the collision page. */
    readonly harmfulEventFirst?: IOptionValue;
    /** "First Harmful Event Location", from the harmful event section of the collision page. */
    readonly harmfulEventLocation?: IOptionValue;
    /** "Amended", from the header section of the collision page. */
    readonly headerAmended?: string;
    /** "Corrected", from the header section of the collision page. */
    readonly headerCorrected?: string;
    /** "SCDPS Crash Report Number", from the header section of the collision page. */
    readonly headerCrashReportNumber?: string;
    /** "Officer Arrived", from the header section of the collision page. */
    readonly headerOfficerArrived?: string;
    /** "Officer Notified", from the header section of the collision page. */
    readonly headerOfficerNotified?: string;
    /** "Of", from the header section of the collision page. */
    readonly headerPageCount?: string;
    /** "Page #", from the header section of the collision page. */
    readonly headerPageNumber?: string;
    /** "Roadway Cleared", from the header section of the collision page. */
    readonly headerRoadwayCleared?: string;
    /** "# of Units", from the header section of the collision page. */
    readonly headerUnitCount?: number;
    /** "Ver", from the header section of the collision page. */
    readonly headerVersion?: string;
    /** "Contributing Factor - Roadway/Environment 1", from the junction section of the collision page. */
    readonly junctionContributingFactorFirst?: IOptionValue;
    /** "Contributing Factor - Roadway/Environment 2", from the junction section of the collision page. */
    readonly junctionContributingFactorSecond?: IOptionValue;
    /** "Relation to Junction", from the junction section of the collision page. */
    readonly junctionRelation?: IOptionValue;
    /** "School Bus Related", from the junction section of the collision page. */
    readonly junctionSchoolBusRelated?: IOptionValue;
    /** "Amended or Corrected Notes", from the narrative section of the narrative page. */
    readonly narrativeAmendedOrCorrectedNotes?: string;
    /** "SCDPS Crash Report Number", from the narrative header section of the narrative page. */
    readonly narrativeHeaderCrashReportNumber?: string;
    /** "Internal Agency Code", from the narrative header section of the narrative page. */
    readonly narrativeHeaderInternalAgencyCode?: string;
    /** "CJA #", from the narrative officer section of the narrative page. */
    readonly narrativeOfficerCjaNumber?: string;
    /** "Internal Agency", from the narrative officer section of the narrative page. */
    readonly narrativeOfficerInternalAgency?: string;
    /** "Investigating Officer", from the narrative officer section of the narrative page. */
    readonly narrativeOfficerName?: string;
    /** "Rank", from the narrative officer section of the narrative page. */
    readonly narrativeOfficerRank?: string;
    /** "Narrative", from the narrative section of the narrative page. */
    readonly narrativeText?: string;
    /** "Auxiliary", from the route section of the collision page. */
    readonly routeAuxiliary?: string;
    /** "Category", from the route section of the collision page. */
    readonly routeCategory?: string;
    /** "Direction", from the route section of the collision page. */
    readonly routeDirection?: string;
    /** "Feet", from the route section of the collision page. */
    readonly routeDistanceOffsetFeet?: string;
    /** "Miles", from the route section of the collision page. */
    readonly routeDistanceOffsetMiles?: string;
    /** "Of", from the route section of the collision page. */
    readonly routeLaneCount?: string;
    /** "Lane #", from the route section of the collision page. */
    readonly routeLaneNumber?: string;
    /** "Route Name", from the route section of the collision page. */
    readonly routeName?: string;
    /** "Route #", from the route section of the collision page. */
    readonly routeNumber?: string;
    /** "R.R. ID", from the route section of the collision page. */
    readonly routeRailroadId?: string;
    /** "Auxiliary", from the second intersection section of the collision page. */
    readonly secondIntersectionAuxiliary?: string;
    /** "Category", from the second intersection section of the collision page. */
    readonly secondIntersectionCategory?: string;
    /** "Route Name", from the second intersection section of the collision page. */
    readonly secondIntersectionRouteName?: string;
    /** "Route #", from the second intersection section of the collision page. */
    readonly secondIntersectionRouteNumber?: string;
    /** "Trafficway Direction", from the trafficway section of the collision page. */
    readonly trafficwayDirection?: IOptionValue;
    /** "Trafficway Divided", from the trafficway section of the collision page. */
    readonly trafficwayDivided?: IOptionValue;
    /** One entry per witness or property owner row on the collision page (always three, blank rows included). A row the data omits, when populating, is left as it stands. */
    readonly witnesses?: ReadonlyArray<ITR310WitnessData>;
    /** "Crash in Work Zone", from the work zone section of the collision page. */
    readonly workZoneCrashLocation?: IOptionValue;
    /** "Law Enforcement in Work Zone", from the work zone section of the collision page. */
    readonly workZoneLawEnforcement?: IOptionValue;
    /** "Work Zone Related", from the work zone section of the collision page. */
    readonly workZoneRelated?: IOptionValue;
    /** "Type of Work Zone", from the work zone section of the collision page. */
    readonly workZoneType?: IOptionValue;
    /** "Worker Present", from the work zone section of the collision page. */
    readonly workZoneWorkerPresent?: IOptionValue;
    /** One entry per person page, in page order. A person the data does not mention leaves that page as it stands. */
    readonly persons?: ReadonlyArray<ITR310PersonData>;
    /** One entry per unit page, in page order. A unit the data does not mention leaves that page as it stands. */
    readonly units?: ReadonlyArray<ITR310UnitData>;
    /** One entry per additional passenger row on the narrative page (always four, blank rows included), for passengers past the first four on the person page. A row the data omits, when populating, is left as it stands. */
    readonly additionalPassengers?: ReadonlyArray<ITR310PassengerData>;
}
