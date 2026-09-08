import {
    ComparisonOperator,
    CompositeRule,
    DateRangeFieldRule,
    FieldValueCondition,
    MaxLengthFieldRule,
    NumberRangeFieldRule,
    PatternFieldRule,
    RequiredFieldRule,
    RuleCollection
} from "@forms/core";
import type { TR310FormSchema } from "./tr310-form-schema";

/** The earliest date of birth the report accepts. */
const earliestDateOfBirth = new Date(Date.UTC(1900, 0, 1));

/** Matches a signed decimal, the format the GPS coordinate boxes ask for. */
const coordinatePattern = /^-?\d+(\.\d+)?$/;

/** Matches the digits an unsigned whole number is written as, for the speed boxes. */
const wholeNumberPattern = /^\d*$/;

/** Matches the letters, digits, spaces and dashes a vehicle plate number may contain. */
const platePattern = /^[A-Za-z0-9 -]*$/;

/** The code the report uses for a yes answer on its yes/no/unknown boxes. */
const yes = "1";

/** The person type code for a motor vehicle driver, as against a non-motorist. */
const driver = "1";

/** The person type code for a non-motorist. */
const nonMotorist = "3";

/** Builds the validation rules for the SC TR-310 traffic collision report. */
export function createRuleCollection(schema: TR310FormSchema): RuleCollection {
    const header = schema.headerFields;
    const collision = schema.collisionFields;
    const route = schema.routeFields;
    const coordinates = schema.coordinatesFields;
    const trafficway = schema.trafficwayFields;
    const conditions = schema.conditionsFields;
    const harmfulEvent = schema.harmfulEventFields;
    const junction = schema.junctionFields;
    const workZone = schema.workZoneFields;
    const collisionOfficer = schema.collisionOfficerFields;

    const personHeader = schema.personHeaderFields;
    const person = schema.personFields;
    const driverLicense = schema.driverLicenseFields;
    const nonMotoristFields = schema.nonMotoristFields;
    const injury = schema.injuryFields;

    const unitHeader = schema.unitHeaderFields;
    const vehicle = schema.vehicleFields;
    const travel = schema.travelFields;
    const unitType = schema.unitTypeFields;
    const events = schema.eventsFields;

    const narrative = schema.narrativeFields;

    /** Satisfied once the collision has been recorded as work zone related, which is what makes the work zone detail owed. */
    const isWorkZoneRelated = new FieldValueCondition(workZone.workZoneRelated, ComparisonOperator.equals, yes);

    /** Satisfied on a person page recording a motor vehicle driver rather than a non-motorist. */
    const isDriver = new FieldValueCondition(personHeader.personHeaderPersonType, ComparisonOperator.equals, driver);

    /** Satisfied on a person page recording a non-motorist rather than a driver. */
    const isNonMotorist = new FieldValueCondition(personHeader.personHeaderPersonType, ComparisonOperator.equals, nonMotorist);

    return new RuleCollection([
        // header
        new RequiredFieldRule(header.headerUnitCount, "Number of Units is required"),

        // collision
        new RequiredFieldRule(collision.collisionDate, "Date of Collision is required"),
        DateRangeFieldRule.notInFuture(collision.collisionDate, "Date of Collision cannot be a Future Date"),
        new RequiredFieldRule(collision.collisionTime, "Time of Collision is required"),
        new RequiredFieldRule(collision.collisionCounty, "County is required"),
        new MaxLengthFieldRule(collision.collisionCityOrTown, 0, 25, "City/Town cannot be more than 25 characters"),

        // route
        new RequiredFieldRule(route.routeCategory, "Route Category is required"),
        new RequiredFieldRule(route.routeName, "Route Name is required"),

        // coordinates - the bounds are the ones printed beside the boxes, which are South Carolina's
        new RequiredFieldRule(coordinates.coordinatesLatitude, "Latitude is required"),
        new PatternFieldRule(coordinates.coordinatesLatitude, coordinatePattern, "Latitude must be a decimal number"),
        new NumberRangeFieldRule(coordinates.coordinatesLatitude, 32.01, 35.22, "Latitude must be between 32.01 and 35.22"),
        new RequiredFieldRule(coordinates.coordinatesLongitude, "Longitude is required"),
        new PatternFieldRule(coordinates.coordinatesLongitude, coordinatePattern, "Longitude must be a decimal number"),
        new NumberRangeFieldRule(coordinates.coordinatesLongitude, -83.38, -78.5, "Longitude must be between -83.38 and -78.5"),

        // trafficway
        new RequiredFieldRule(trafficway.trafficwayDirection, "Trafficway Direction is required"),
        new RequiredFieldRule(trafficway.trafficwayDivided, "Trafficway Divided is required"),

        // conditions
        new RequiredFieldRule(conditions.conditionsLight, "Light Condition is required"),
        new RequiredFieldRule(conditions.conditionsWeatherFirst, "Weather Condition is required"),
        new RequiredFieldRule(conditions.conditionsRoadSurface, "Road Surface Condition is required"),
        new RequiredFieldRule(conditions.conditionsMannerOfCollision, "Manner of Collision is required"),

        // events and junction
        new RequiredFieldRule(harmfulEvent.harmfulEventFirst, "First Harmful Event is required"),
        new RequiredFieldRule(harmfulEvent.harmfulEventLocation, "First Harmful Event Location is required"),
        new RequiredFieldRule(junction.junctionRelation, "Relation to Junction is required"),
        new RequiredFieldRule(junction.junctionSchoolBusRelated, "School Bus Related is required"),

        // work zone - the detail is only owed once the collision is recorded as work zone related, so a collision
        // that happened nowhere near one never demands it
        new RequiredFieldRule(workZone.workZoneRelated, "Work Zone Related is required"),
        new RequiredFieldRule(workZone.workZoneCrashLocation, "Crash in Work Zone is required for a work zone collision").when(isWorkZoneRelated),
        new RequiredFieldRule(workZone.workZoneType, "Type of Work Zone is required for a work zone collision").when(isWorkZoneRelated),
        new RequiredFieldRule(workZone.workZoneWorkerPresent, "Worker Present is required for a work zone collision").when(isWorkZoneRelated),
        new RequiredFieldRule(workZone.workZoneLawEnforcement, "Law Enforcement in Work Zone is required for a work zone collision").when(isWorkZoneRelated),

        // investigating officer
        new RequiredFieldRule(collisionOfficer.collisionOfficerName, "Investigating Officer is required"),
        new MaxLengthFieldRule(collisionOfficer.collisionOfficerName, 0, 50, "Investigating Officer cannot be more than 50 characters"),
        new MaxLengthFieldRule(collisionOfficer.collisionOfficerRank, 0, 6, "Rank cannot be more than 6 characters"),
        new MaxLengthFieldRule(collisionOfficer.collisionOfficerCjaNumber, 0, 10, "CJA Number cannot be more than 10 characters"),

        // person - these are evaluated once per person page, each against its own page, so a report with three
        // people reports the violations of all three
        new RequiredFieldRule(personHeader.personHeaderPersonNumber, "Person Number is required"),
        new RequiredFieldRule(personHeader.personHeaderUnitNumber, "Unit Number is required"),
        new RequiredFieldRule(personHeader.personHeaderPersonType, "Person Type is required"),
        new RequiredFieldRule(person.personFirstName, "Person First Name is required"),
        new MaxLengthFieldRule(person.personFirstName, 0, 30, "First Name cannot be more than 30 characters"),
        new MaxLengthFieldRule(person.personMiddleName, 0, 1, "Middle Initial cannot be more than 1 character"),
        new RequiredFieldRule(person.personLastName, "Person Last Name is required"),
        new MaxLengthFieldRule(person.personLastName, 0, 30, "Last Name cannot be more than 30 characters"),
        DateRangeFieldRule.notBefore(person.personDateOfBirth, earliestDateOfBirth, "Date of Birth cannot be before 01/01/1900"),
        DateRangeFieldRule.notInFuture(person.personDateOfBirth, "Date of Birth cannot be a Future Date"),
        new MaxLengthFieldRule(person.personZipCode, 0, 10, "Zip Code cannot be more than 10 characters"),
        new RequiredFieldRule(injury.injuryStatus, "Injury Status is required"),

        // a driver owes a licence and a non-motorist owes a unit type; neither owes the other's
        new RequiredFieldRule(driverLicense.driverLicenseNumber, "Driver License Number is required for a driver").when(isDriver),
        new MaxLengthFieldRule(driverLicense.driverLicenseNumber, 0, 25, "Driver License Number cannot be more than 25 characters"),
        new RequiredFieldRule(driverLicense.driverLicenseState, "Driver License State is required for a driver").when(isDriver),
        new RequiredFieldRule(nonMotoristFields.nonMotoristUnitType, "Non-Motorist Unit Type is required for a non-motorist").when(isNonMotorist),

        // unit - evaluated once per unit page, the same way the person rules are
        new RequiredFieldRule(unitHeader.unitHeaderUnitNumber, "Unit Number is required"),
        new RequiredFieldRule(unitType.unitTypeUnit, "Unit Type is required"),
        new RequiredFieldRule(vehicle.vehicleStatus, "Unit Status is required"),
        new RequiredFieldRule(vehicle.vehicleDamageExtent, "Extent of Damage is required"),
        new RequiredFieldRule(vehicle.vehicleHitAndRun, "Hit & Run is required"),
        CompositeRule.and(vehicle.vehiclePlateNumber, field => [
            new MaxLengthFieldRule(field, 0, 20, "Vehicle Plate Number cannot be more than 20 characters"),
            new PatternFieldRule(field, platePattern, "Vehicle Plate Number can only contain letters, numbers, spaces or dashes")
        ]),
        new MaxLengthFieldRule(vehicle.vehicleIdentificationNumber, 0, 17, "VIN cannot be more than 17 characters"),
        new RequiredFieldRule(vehicle.vehicleYear, "Vehicle Year is required"),
        new RequiredFieldRule(vehicle.vehicleMake, "Vehicle Make is required"),
        new PatternFieldRule(travel.travelEstimatedSpeed, wholeNumberPattern, "Estimated Speed must be a whole number"),
        new PatternFieldRule(travel.travelSpeedLimit, wholeNumberPattern, "Speed Limit must be a whole number"),
        new RequiredFieldRule(events.eventsMostHarmful, "Most Harmful Event is required"),

        // narrative
        new RequiredFieldRule(narrative.narrativeText, "Narrative is required")
    ]);
}
