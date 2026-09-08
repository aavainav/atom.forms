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
import type { OKTrafficFormSchema } from "./traffic-form-schema";

/** The earliest date of birth the form accepts. */
const earliestDateOfBirth = new Date(Date.UTC(1900, 0, 1));

/** Matches the five digits a zip code is written as, with the optional four digit extension. */
const zipCodePattern = /^\d{5}(-\d{4})?$/;

/** Matches the letters, digits, spaces and dashes a vehicle plate number may contain. */
const platePattern = /^[A-Za-z0-9 -]*$/;

/** Matches the seventeen characters a modern VIN is written as; I, O and Q are never among them. */
const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Matches a height written as feet and inches, such as `5-11` or `6-02`. */
const heightPattern = /^\d-\d{1,2}$/;

/** Matches the nine digits of a social security number, with or without the dashes. */
const socialSecurityNumberPattern = /^\d{3}-?\d{2}-?\d{4}$/;

/** Matches a ten digit phone number, with or without the usual punctuation. */
const phonePattern = /^\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}$/;

/** The code the form uses for a yes answer on its Y/N boxes. */
const yes = "Y";

/** The earliest model year the form accepts. */
const earliestVehicleYear = 1886;

/** The largest fine the form accepts, well above any traffic penalty but low enough to catch a mistyped amount. */
const maximumAmountDue = 100000;

/** Builds the validation rules for the Oklahoma City traffic citation form. */
export function createRuleCollection(schema: OKTrafficFormSchema): RuleCollection {
    const arraignment = schema.arraignmentFields;
    const defendant = schema.defendantFields;
    const description = schema.descriptionFields;
    const license = schema.licenseFields;
    const offense = schema.offenseFields;
    const officer = schema.officerFields;
    const owner = schema.registeredOwnerFields;
    const status = schema.statusFields;
    const vehicle = schema.vehicleFields;
    const violation = schema.violationFields;
    const violationInformation = schema.violationInformationFields;
    const witness = schema.witnessFields;

    return new RuleCollection([
        new RequiredFieldRule(defendant.defendantLastName, "Last name is required"),
        new MaxLengthFieldRule(defendant.defendantLastName, 0, 30, "Last name cannot be more than 30 characters"),
        new RequiredFieldRule(defendant.defendantFirstName, "First name is required"),
        new MaxLengthFieldRule(defendant.defendantFirstName, 0, 30, "First name cannot be more than 30 characters"),
        new MaxLengthFieldRule(defendant.defendantMiddleName, 0, 30, "Middle name cannot be more than 30 characters"),
        new MaxLengthFieldRule(defendant.defendantAddress, 0, 100, "Address cannot be more than 100 characters"),
        new MaxLengthFieldRule(defendant.defendantCity, 0, 30, "City cannot be more than 30 characters"),
        new PatternFieldRule(defendant.defendantZipCode, zipCodePattern, "Zip must be five digits, optionally followed by a four digit extension"),

        new RequiredFieldRule(license.licenseIdentifier, "Driver license number is required"),
        new MaxLengthFieldRule(license.licenseIdentifier, 0, 25, "Driver license number cannot be more than 25 characters"),
        new MaxLengthFieldRule(license.licenseClass, 0, 5, "Class cannot be more than 5 characters"),
        new MaxLengthFieldRule(license.licenseEndorsements, 0, 10, "Endorsements cannot be more than 10 characters"),
        new RequiredFieldRule(license.licenseState, "Driver license state is required"),

        new RequiredFieldRule(description.descriptionDateOfBirth, "Date of birth is required"),
        DateRangeFieldRule.notInFuture(description.descriptionDateOfBirth, "Date of birth cannot be in the future"),
        DateRangeFieldRule.notBefore(description.descriptionDateOfBirth, earliestDateOfBirth, "Date of birth cannot be before 1900"),
        new RequiredFieldRule(description.descriptionSex, "Sex is required"),
        new PatternFieldRule(description.descriptionHeight, heightPattern, "Height must be written as feet and inches, such as 5-11"),
        new NumberRangeFieldRule(description.descriptionWeight, 0, 1000, "Weight is not within the allowed range"),

        new NumberRangeFieldRule(vehicle.vehicleYear, earliestVehicleYear, new Date().getFullYear() + 1, "Vehicle year is not within the allowed range"),
        new MaxLengthFieldRule(vehicle.vehicleStyle, 0, 20, "Style cannot be more than 20 characters"),
        new MaxLengthFieldRule(vehicle.vehicleColor, 0, 20, "Color cannot be more than 20 characters"),
        new PatternFieldRule(vehicle.vehicleVin, vinPattern, "VIN must be 17 characters and cannot contain the letters I, O or Q"),
        CompositeRule.and(vehicle.vehicleTag, field => [
            new MaxLengthFieldRule(field, 0, 20, "Tag cannot be more than 20 characters"),
            new PatternFieldRule(field, platePattern, "Tag can only contain letters, numbers, spaces or dashes")
        ]),

        new RequiredFieldRule(violation.violationDate, "Date of offense is required"),
        DateRangeFieldRule.notInFuture(violation.violationDate, "Date of offense cannot be in the future"),
        new RequiredFieldRule(violation.violationTime, "Time of offense is required"),
        new RequiredFieldRule(violation.violationCounty, "County is required"),
        new RequiredFieldRule(violation.violationLocation, "Location is required"),
        new MaxLengthFieldRule(violation.violationLocation, 0, 100, "Location cannot be more than 100 characters"),
        new RequiredFieldRule(violation.violationMunicipalCode, "Municipal code is required"),
        new MaxLengthFieldRule(violation.violationMunicipalCode, 0, 20, "Municipal code cannot be more than 20 characters"),
        new MaxLengthFieldRule(violation.violationOffenseCode, 0, 20, "Offense code cannot be more than 20 characters"),

        new NumberRangeFieldRule(offense.offenseAmountDue, 0, maximumAmountDue, "Amount due is not within the allowed range"),

        new MaxLengthFieldRule(violationInformation.violationInformationIncidentNumber, 0, 25, "Incident number cannot be more than 25 characters"),
        new NumberRangeFieldRule(violationInformation.violationInformationActualSpeed, 0, 300, "Actual speed is not within the allowed range"),
        new NumberRangeFieldRule(violationInformation.violationInformationSpeedLimit, 0, 100, "Speed limit is not within the allowed range"),
        // a speed was measured, so the limit it is being measured against has to be recorded alongside it
        new RequiredFieldRule(violationInformation.violationInformationSpeedLimit, "Speed limit is required when an actual speed is recorded")
            .when(new FieldValueCondition(violationInformation.violationInformationActualSpeed, ComparisonOperator.isNotEmpty)),

        new RequiredFieldRule(officer.officerName, "Officer is required"),
        new RequiredFieldRule(officer.officerCommissionNumber, "Commission number is required"),
        new MaxLengthFieldRule(officer.officerCommissionNumber, 0, 10, "Commission number cannot be more than 10 characters"),
        new MaxLengthFieldRule(officer.officerSecondCommissionNumber, 0, 10, "Commission number cannot be more than 10 characters"),
        // a second officer is only partly recorded if one of the two boxes naming them is left empty
        new RequiredFieldRule(officer.officerSecondCommissionNumber, "Commission number is required for the second officer")
            .when(new FieldValueCondition(officer.officerSecondName, ComparisonOperator.isNotEmpty)),

        new RequiredFieldRule(arraignment.arraignmentCourtDate, "Arraignment court date is required"),

        new MaxLengthFieldRule(witness.witnessName, 0, 60, "Witness name cannot be more than 60 characters"),
        new MaxLengthFieldRule(witness.witnessAddress, 0, 100, "Witness address cannot be more than 100 characters"),
        new MaxLengthFieldRule(witness.witnessCity, 0, 30, "Witness city cannot be more than 30 characters"),
        new PatternFieldRule(witness.witnessZipCode, zipCodePattern, "Witness zip must be five digits, optionally followed by a four digit extension"),
        new PatternFieldRule(witness.witnessPhone, phonePattern, "Witness phone must be a ten digit number"),
        new PatternFieldRule(witness.witnessSocialSecurityNumber, socialSecurityNumberPattern, "Witness SSN must be nine digits"),

        // the owner's own boxes are left empty when they are the suspect, whose details page one already carries
        new RequiredFieldRule(owner.ownerName, "Registered owner is required unless the owner is the suspect")
            .when(new FieldValueCondition(owner.ownerSameAsSuspect, ComparisonOperator.notEquals, yes)),
        new MaxLengthFieldRule(owner.ownerName, 0, 60, "Registered owner name cannot be more than 60 characters"),
        new MaxLengthFieldRule(owner.ownerAddress, 0, 100, "Registered owner address cannot be more than 100 characters"),
        new MaxLengthFieldRule(owner.ownerCity, 0, 30, "Registered owner city cannot be more than 30 characters"),
        new PatternFieldRule(owner.ownerZipCode, zipCodePattern, "Registered owner zip must be five digits, optionally followed by a four digit extension"),

        new PatternFieldRule(status.statusMainPhone, phonePattern, "Main phone must be a ten digit number"),
        CompositeRule.and(status.statusTrailerTag, field => [
            new MaxLengthFieldRule(field, 0, 20, "Trailer tag cannot be more than 20 characters"),
            new PatternFieldRule(field, platePattern, "Trailer tag can only contain letters, numbers, spaces or dashes")
        ]),
        new MaxLengthFieldRule(status.statusTribe, 0, 30, "Tribe cannot be more than 30 characters"),
        new MaxLengthFieldRule(status.statusAssignment, 0, 20, "Assignment cannot be more than 20 characters")
    ]);
}
