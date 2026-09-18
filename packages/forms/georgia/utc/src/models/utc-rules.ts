import {
    ComparisonOperator,
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
import type { GAUTCFormSchema } from "./utc-form-schema";

/** The earliest date of birth the citation accepts. */
const earliestDateOfBirth = new Date(Date.UTC(1900, 0, 1));

/** The earliest model year the citation accepts. */
const earliestVehicleYear = 1886;

/** Matches the three letter month the header's "On Month" box carries. */
const abbreviatedMonthPattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i;

/** Matches the letters, digits, spaces and dashes a vehicle registration number may contain. */
const platePattern = /^[A-Za-z0-9 -]*$/;

/** Matches a ten digit phone number, with or without the usual punctuation. */
const phonePattern = /^\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}$/;

/** Matches the one or two digits a day, hour, minute or two digit year box carries. */
const twoDigitPattern = /^\d{1,2}$/;

/** Matches the five digits a zip code is written as, with the optional four digit extension. */
const zipCodePattern = /^\d{5}(-\d{4})?$/;

/** The largest speed the citation accepts, high enough for any clocked vehicle and low enough to catch a mistyped one. */
const maximumSpeed = 300;

/**
 * Builds the validation rules. Only the boxes an officer must complete before serving are required -- the court
 * page has no required rules at all, since it's completed by the clerk and judge days later, and an officer
 * saving a citation shouldn't be told the disposition is missing.
 */
export function createRuleCollection(schema: GAUTCFormSchema): RuleCollection {
    const certification = schema.certificationFields;
    const header = schema.headerFields;
    const location = schema.locationFields;
    const offense = schema.offenseFields;
    const officer = schema.officerFields;
    const summons = schema.summonsFields;
    const vehicle = schema.vehicleFields;
    const violation = schema.violationFields;
    const violator = schema.violatorFields;

    return new RuleCollection([
        new RequiredFieldRule(header.headerCitationNumber, "Citation number is required"),
        new MaxLengthFieldRule(header.headerCitationNumber, 0, 20, "Citation number cannot be more than 20 characters"),
        new MaxLengthFieldRule(header.headerCicaNumber, 0, 20, "CICA number cannot be more than 20 characters"),
        new MaxLengthFieldRule(header.headerNcicNumber, 0, 20, "NCIC number cannot be more than 20 characters"),
        new RequiredFieldRule(header.headerMonth, "Month of the offense is required"),
        new PatternFieldRule(header.headerMonth, abbreviatedMonthPattern, "Month must be a three letter abbreviation, such as Sep"),
        new RequiredFieldRule(header.headerDay, "Day of the offense is required"),
        new PatternFieldRule(header.headerDay, twoDigitPattern, "Day must be one or two digits"),
        new RequiredFieldRule(header.headerYear, "Year of the offense is required"),
        new PatternFieldRule(header.headerYear, twoDigitPattern, "Year must be the last two digits of the year"),
        new PatternFieldRule(header.headerHour, twoDigitPattern, "Hour must be one or two digits"),
        new PatternFieldRule(header.headerMinute, twoDigitPattern, "Minute must be one or two digits"),
        // the time is only half recorded if the clock face is written down without saying which half of the day it is
        new RequiredSelectionRule(header.headerAm, [header.headerAm, header.headerPm], "AM or PM is required when a time is recorded")
            .when(new FieldValueCondition(header.headerHour, ComparisonOperator.isNotEmpty)),

        new RequiredFieldRule(violator.violatorLastName, "Last name is required"),
        new MaxLengthFieldRule(violator.violatorLastName, 0, 30, "Last name cannot be more than 30 characters"),
        new RequiredFieldRule(violator.violatorFirstName, "First name is required"),
        new MaxLengthFieldRule(violator.violatorFirstName, 0, 30, "First name cannot be more than 30 characters"),
        new MaxLengthFieldRule(violator.violatorMiddleName, 0, 30, "Middle name cannot be more than 30 characters"),
        new MaxLengthFieldRule(violator.violatorSuffix, 0, 10, "Suffix cannot be more than 10 characters"),
        new RequiredFieldRule(violator.violatorOperatorLicenseNumber, "Operator license number is required"),
        new MaxLengthFieldRule(violator.violatorOperatorLicenseNumber, 0, 25, "Operator license number cannot be more than 25 characters"),
        new MaxLengthFieldRule(violator.violatorLicenseClass, 0, 5, "License class cannot be more than 5 characters"),
        new MaxLengthFieldRule(violator.violatorLicenseEndorsements, 0, 10, "Endorsements cannot be more than 10 characters"),
        DateRangeFieldRule.notInFuture(violator.violatorDateOfBirth, "Date of birth cannot be in the future"),
        DateRangeFieldRule.notBefore(violator.violatorDateOfBirth, earliestDateOfBirth, "Date of birth cannot be before 1900"),
        new RequiredFieldRule(violator.violatorDateOfBirth, "Date of birth is required"),
        new RequiredFieldRule(violator.violatorSex, "Sex is required"),
        new MaxLengthFieldRule(violator.violatorRace, 0, 20, "Race cannot be more than 20 characters"),
        new MaxLengthFieldRule(violator.violatorAddress, 0, 100, "Address cannot be more than 100 characters"),
        new MaxLengthFieldRule(violator.violatorApartment, 0, 15, "Apartment cannot be more than 15 characters"),
        new MaxLengthFieldRule(violator.violatorCity, 0, 30, "City cannot be more than 30 characters"),
        new PatternFieldRule(violator.violatorZipCode, zipCodePattern, "Zip must be five digits, optionally followed by a four digit extension"),
        new PatternFieldRule(violator.violatorPhone, phonePattern, "Phone must be a ten digit number"),
        new NumberRangeFieldRule(violator.violatorWeight, 0, 1000, "Weight is not within the allowed range"),
        new MaxLengthFieldRule(violator.violatorHeight, 0, 10, "Height cannot be more than 10 characters"),
        new MaxLengthFieldRule(violator.violatorHair, 0, 20, "Hair cannot be more than 20 characters"),
        new MaxLengthFieldRule(violator.violatorEye, 0, 20, "Eye cannot be more than 20 characters"),

        new NumberRangeFieldRule(vehicle.vehicleYear, earliestVehicleYear, new Date().getFullYear() + 1, "Vehicle year is not within the allowed range"),
        new MaxLengthFieldRule(vehicle.vehicleColor, 0, 20, "Color cannot be more than 20 characters"),
        CompositeRule.and(vehicle.vehicleRegistrationNumber, field => [
            new MaxLengthFieldRule(field, 0, 20, "Registration number cannot be more than 20 characters"),
            new PatternFieldRule(field, platePattern, "Registration number can only contain letters, numbers, spaces or dashes")
        ]),
        new PatternFieldRule(vehicle.vehicleRegistrationYear, twoDigitPattern, "Registration year must be the last two digits of the year"),

        new NumberRangeFieldRule(violation.violationClockedSpeed, 0, maximumSpeed, "Clocked speed is not within the allowed range"),
        new NumberRangeFieldRule(violation.violationSpeedZone, 0, 100, "Speed zone is not within the allowed range"),
        // a speed was clocked, so the limit it is being measured against has to be recorded alongside it
        new RequiredFieldRule(violation.violationSpeedZone, "Speed zone is required when a clocked speed is recorded")
            .when(new FieldValueCondition(violation.violationClockedSpeed, ComparisonOperator.isNotEmpty)),
        // a speed measured by a device is only defensible if the device it was measured with is on the citation
        new RequiredSelectionRule(violation.violationVascar, [violation.violationVascar, violation.violationLaser, violation.violationRadar], "The speed detection used is required when a clocked speed is recorded")
            .when(new FieldValueCondition(violation.violationClockedSpeed, ComparisonOperator.isNotEmpty)),
        new MaxLengthFieldRule(violation.violationSerialNumber, 0, 25, "Serial # cannot be more than 25 characters"),
        new MaxLengthFieldRule(violation.violationCalibrationCheck, 0, 25, "Calibration/Check cannot be more than 25 characters"),

        new MaxLengthFieldRule(offense.offenseCodeSection, 0, 25, "Code section cannot be more than 25 characters"),
        new MaxLengthFieldRule(offense.offenseDescription, 0, 200, "Offense cannot be more than 200 characters"),
        new MaxLengthFieldRule(offense.offenseRemarks, 0, 200, "Remarks cannot be more than 200 characters"),
        // an offense written in is charged under one body of law or the other, and which one decides the court
        new RequiredSelectionRule(offense.offenseStateLaw, [offense.offenseStateLaw, offense.offenseLocalOrdinance], "State law or local ordinance is required for a written-in offense")
            .when(new FieldValueCondition(offense.offenseDescription, ComparisonOperator.isNotEmpty)),
        // the companion citation is what a yes answer points at, so a yes without one records nothing
        new RequiredFieldRule(offense.offenseCompanionCitation, "The companion citation number or name is required when there is a companion case")
            .when(new FieldValueCondition(offense.offenseCompanionCaseYes, ComparisonOperator.equals, true)),

        // the conditions bar is a set of optional observations - the citation is valid with none of them ticked -
        // so nothing in that section carries a rule
        new RequiredFieldRule(location.locationCity, "City is required"),
        new MaxLengthFieldRule(location.locationCity, 0, 30, "City cannot be more than 30 characters"),
        new RequiredFieldRule(location.locationCounty, "County is required"),
        new RequiredFieldRule(location.locationStreet, "The location of the offense is required"),
        new MaxLengthFieldRule(location.locationStreet, 0, 100, "The location cannot be more than 100 characters"),

        new RequiredFieldRule(officer.officerName, "Officer name is required"),
        new MaxLengthFieldRule(officer.officerName, 0, 60, "Officer name cannot be more than 60 characters"),
        new RequiredFieldRule(officer.officerApdIdNumber, "APD ID number is required"),
        new MaxLengthFieldRule(officer.officerApdIdNumber, 0, 10, "APD ID number cannot be more than 10 characters"),
        new MaxLengthFieldRule(officer.officerSecondName, 0, 60, "Second officer name cannot be more than 60 characters"),
        new MaxLengthFieldRule(officer.officerSecondApdIdNumber, 0, 10, "APD ID number cannot be more than 10 characters"),
        // a second officer is only partly recorded if one of the two boxes naming them is left empty
        new RequiredFieldRule(officer.officerSecondApdIdNumber, "APD ID number is required for the second officer")
            .when(new FieldValueCondition(officer.officerSecondName, ComparisonOperator.isNotEmpty)),

        new RequiredFieldRule(summons.summonsAppearanceDay, "The day of the court appearance is required"),
        new PatternFieldRule(summons.summonsAppearanceDay, twoDigitPattern, "The day must be one or two digits"),
        new RequiredFieldRule(summons.summonsAppearanceMonth, "The month of the court appearance is required"),
        new RequiredFieldRule(summons.summonsAppearanceYear, "The year of the court appearance is required"),
        new PatternFieldRule(summons.summonsHour, twoDigitPattern, "Hour must be one or two digits"),
        new PatternFieldRule(summons.summonsMinute, twoDigitPattern, "Minute must be one or two digits"),
        new RequiredSelectionRule(summons.summonsAm, [summons.summonsAm, summons.summonsPm], "AM or PM is required for the court appearance time"),
        new RequiredFieldRule(summons.summonsCourtName, "The court to appear in is required"),
        new MaxLengthFieldRule(summons.summonsCourtName, 0, 60, "The court name cannot be more than 60 characters"),
        new MaxLengthFieldRule(summons.summonsReleaseTo, 0, 60, "Release to cannot be more than 60 characters"),

        new RequiredFieldRule(certification.certificationOfficerSignature, "The arresting officer's signature is required"),
        new PatternFieldRule(certification.certificationSwornDay, twoDigitPattern, "The day must be one or two digits"),
        new PatternFieldRule(certification.certificationSwornYear, twoDigitPattern, "The year must be the last two digits of the year")
    ]);
}
