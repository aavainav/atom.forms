import {
    AlphanumericFieldRule,
    ComparisonOperator,
    CompositeCondition,
    CompositeRule,
    DateRangeFieldRule,
    FieldValueCondition,
    MaxLengthFieldRule,
    NumberRangeFieldRule,
    PatternFieldRule,
    RequiredFieldRule,
    RequiredSelectionRule,
    RuleCollection
} from "@forms/core";
import type { PublicContactOrWarningFormSchema } from "./public-contact-or-warning-form-schema";

/** The earliest date of birth the form accepts. */
const earliestDateOfBirth = new Date(Date.UTC(1900, 0, 1));

/** Matches a signed decimal carrying exactly five decimal digits, the precision required of a coordinate. */
const coordinatePattern = /^-?\d+\.\d{5}$/;

/** Matches the letters, digits, spaces and dashes a vehicle license number may contain. */
const vehicleLicensePattern = /^[A-Za-z0-9 -]*$/;

/** Builds the validation rules for the SC Form 432 (Public Contact / Warning) record. */
export function createRuleCollection(schema: PublicContactOrWarningFormSchema): RuleCollection {
    const agency = schema.agencyFields;
    const person = schema.personFields;
    const route = schema.routeFields;
    const stop = schema.stopFields;
    const vehicle = schema.vehicleFields;
    const nature = schema.natureOfContactFields;
    const primaryReason = schema.primaryReasonFields;
    const searches = schema.searchesFields;
    const officer = schema.officerFields;

    /** The nature of contact options, exactly one of which must be checked. */
    const natureOptions = [
        nature.natureOther,
        nature.natureSpeeding,
        nature.natureContactOnly,
        nature.natureImproperLaneUse,
        nature.natureFailureToDimLights,
        nature.natureImproperBacking,
        nature.natureImproperLights,
        nature.natureImproperTurn,
        nature.natureDisregardingStopSign,
        nature.natureSeatBeltViolation,
        nature.natureHandsFreeViolation,
        nature.natureDisregardingTrafficSignal,
        nature.natureFollowingTooClose,
        nature.natureChangingLanesUnlawfully,
        nature.natureNoRightOfWay,
        nature.natureDefectiveEquipment,
        nature.natureImproperPassing,
        nature.natureDriversLicenseViolation,
        nature.natureVehicleLicenseViolation,
        nature.naturePedestrian,
        nature.natureImmigrationStop
    ];

    /** The primary reason options, exactly one of which must be checked. */
    const primaryReasonOptions = [
        primaryReason.primaryReasonTrafficCollision,
        primaryReason.primaryReasonMovingViolation,
        primaryReason.primaryReasonNonMovingViolation,
        primaryReason.primaryReasonMotoristAssistance,
        primaryReason.primaryReasonBolo,
        primaryReason.primaryReasonSuspiciousActivity
    ];

    return new RuleCollection([
        // agency
        new MaxLengthFieldRule(agency.agencyCity, 0, 25, "City cannot be more than 25 characters"),
        new RequiredFieldRule(agency.agencyCounty, "County is required"),

        // person
        new RequiredFieldRule(person.personFirstName, "Person First Name is required"),
        new MaxLengthFieldRule(person.personFirstName, 0, 30, "First Name cannot be more than 30 characters"),
        new MaxLengthFieldRule(person.personMiddleInitial, 0, 1, "Middle Initial cannot be more than 1 character"),
        new RequiredFieldRule(person.personLastName, "Person Last Name is required"),
        new MaxLengthFieldRule(person.personLastName, 0, 30, "Last Name can not be more than 30 characters"),
        // the licensed state is chosen from the state list, so its code is as long as that list says it is and
        // there is no length left to check; a max length rule here would read the pair as a string and never fire
        new RequiredFieldRule(person.personLicensedState, "Driver License State is required"),
        new RequiredFieldRule(person.personDriverLicenseNumber, "DL Number is required"),
        new MaxLengthFieldRule(person.personDriverLicenseNumber, 0, 25, "License Number can not be more than 25 characters"),
        new RequiredFieldRule(person.personRace, "Race is required"),
        new RequiredFieldRule(person.personGender, "Sex is required"),
        new RequiredFieldRule(person.personDateOfBirth, "Date of Birth is required"),
        new MaxLengthFieldRule(person.personDateOfBirth, 0, 10, "DOB cannot be more than 10 characters"),
        DateRangeFieldRule.notBefore(person.personDateOfBirth, earliestDateOfBirth, "Date of Birth cannot be before 01/01/1900"),
        DateRangeFieldRule.notInFuture(person.personDateOfBirth, "Date of Birth cannot be a Future Date"),

        // coordinates
        new RequiredFieldRule(person.personLatitude, "Latitude is required"),
        new PatternFieldRule(person.personLatitude, coordinatePattern, "Latitude must be a valid number with 5 decimal digits"),
        new NumberRangeFieldRule(person.personLatitude, -90, 90, "Latitude must be a number between -90 to 90"),
        new RequiredFieldRule(person.personLongitude, "Longitude is required"),
        new PatternFieldRule(person.personLongitude, coordinatePattern, "Longitude must be a valid number with 5 decimal digits"),
        new NumberRangeFieldRule(person.personLongitude, -180, 180, "Longitude must be a number between -180 to 180"),

        // route
        new RequiredFieldRule(route.routeType, "Route Category is required"),
        new RequiredFieldRule(route.routeNumberOrName, "Route Number is required"),

        // stop
        new RequiredFieldRule(stop.stopCounty, "County is required"),
        new RequiredFieldRule(stop.stopDate, "Date of Contact is required"),
        DateRangeFieldRule.notInFuture(stop.stopDate, "Date of Contact cannot be a Future Date"),
        new RequiredFieldRule(stop.stopTime, "Contact Time is required"),
        CompositeRule.and(stop.stopCadCallNumber, field => [
            new MaxLengthFieldRule(field, 0, 15, "CAD Number cannot be more than 15 characters"),
            new AlphanumericFieldRule(field, "CAD Number can only contain numbers or alphabets")
        ]),

        // vehicle
        new RequiredFieldRule(vehicle.vehicleLicenseNumber, "Vehicle License Number is required"),
        new MaxLengthFieldRule(vehicle.vehicleLicenseNumber, 0, 20, "Vehicle License Number cannot be more than 20 characters"),
        new PatternFieldRule(vehicle.vehicleLicenseNumber, vehicleLicensePattern, "Vehicle License Number can only contain letters, numbers, spaces or dashes"),
        new RequiredFieldRule(vehicle.vehicleState, "State is required"),
        new RequiredFieldRule(vehicle.vehicleYear, "Vehicle Year is required"),
        new RequiredFieldRule(vehicle.vehicleMake, "Make is required"),

        // nature of contact
        new RequiredSelectionRule(nature.natureOther, natureOptions, "At least one option should be selected"),
        new RequiredFieldRule(nature.natureOtherSpecify, "Please provide explanation")
            .when(new FieldValueCondition(nature.natureOther, ComparisonOperator.equals, true)),
        new MaxLengthFieldRule(nature.natureOtherSpecify, 0, 50, "Other cannot be more than 50 characters"),

        // primary reason for contact
        // the section has no "other" checkbox, so the free-text field stands in for one: either a listed reason
        // is picked or an explanation is given, and each rule stands down once the other has been satisfied.
        new RequiredSelectionRule(primaryReason.primaryReasonTrafficCollision, primaryReasonOptions, "At least one option should be selected")
            .when(new FieldValueCondition(primaryReason.primaryReasonOtherSpecify, ComparisonOperator.isEmpty)),
        new RequiredFieldRule(primaryReason.primaryReasonOtherSpecify, "Please provide explanation")
            .when(CompositeCondition.all(...primaryReasonOptions.map(option => new FieldValueCondition(option, ComparisonOperator.equals, false)))),
        new MaxLengthFieldRule(primaryReason.primaryReasonOtherSpecify, 0, 50, "Other cannot be more than 50 characters"),

        // searches
        // an explanation is owed only when a search actually took place and none of the listed bases was given,
        // otherwise every record without a search would demand one.
        new RequiredFieldRule(searches.searchesBasisOtherSpecify, "Please provide explanation")
            .when(CompositeCondition.all(
                CompositeCondition.any(
                    new FieldValueCondition(searches.searchesOfDriver, ComparisonOperator.equals, true),
                    new FieldValueCondition(searches.searchesOfPedestrian, ComparisonOperator.equals, true),
                    new FieldValueCondition(searches.searchesOfVehicle, ComparisonOperator.equals, true),
                    new FieldValueCondition(searches.searchesOfPassenger, ComparisonOperator.equals, true)
                ),
                new FieldValueCondition(searches.searchesMadeByConsent, ComparisonOperator.equals, false),
                new FieldValueCondition(searches.searchesIncidentToArrest, ComparisonOperator.equals, false),
                new FieldValueCondition(searches.searchesInventoryVehicleTowed, ComparisonOperator.equals, false),
                new FieldValueCondition(searches.searchesProbableCause, ComparisonOperator.equals, false)
            )),
        new MaxLengthFieldRule(searches.searchesBasisOtherSpecify, 0, 50, "Other cannot be more than 50 characters"),

        // officer
        new RequiredFieldRule(officer.officerIssuedBy, "Officer Name is required"),
        new MaxLengthFieldRule(officer.officerIssuedBy, 0, 50, "Officer First Name cannot be more than 50 characters"),
        new RequiredFieldRule(officer.officerRank, "Officer Rank is required"),
        new MaxLengthFieldRule(officer.officerRank, 0, 6, "Rank cannot be more than 6 characters"),
        new MaxLengthFieldRule(officer.officerScCjaNumber, 0, 10, "SCCJA number cannot be more than 10 characters")
    ]);
}
