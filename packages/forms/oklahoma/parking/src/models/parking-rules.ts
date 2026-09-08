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
import type { OKParkingFormSchema } from "./parking-form-schema";

/** Matches the five digits a zip code is written as, with the optional four digit extension. */
const zipCodePattern = /^\d{5}(-\d{4})?$/;

/** Matches the letters, digits, spaces and dashes a vehicle license number may contain. */
const licensePlatePattern = /^[A-Za-z0-9 -]*$/;

/** Matches the seventeen characters a modern VIN is written as; I, O and Q are never among them. */
const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

/** The earliest model year the form accepts. */
const earliestVehicleYear = 1886;

/** The largest fine the form accepts, well above any parking penalty but low enough to catch a mistyped amount. */
const maximumAmountDue = 100000;

/** Builds the validation rules for the Oklahoma City parking violation form. */
export function createRuleCollection(schema: OKParkingFormSchema): RuleCollection {
    const court = schema.courtFields;
    const officer = schema.officerFields;
    const owner = schema.registeredOwnerFields;
    const payment = schema.paymentFields;
    const record = schema.recordFields;
    const vehicle = schema.vehicleFields;
    const vehicleDetail = schema.vehicleDetailFields;
    const violation = schema.violationFields;

    return new RuleCollection([
        new RequiredFieldRule(violation.violationDate, "Date of violation is required"),
        DateRangeFieldRule.notInFuture(violation.violationDate, "Date of violation cannot be in the future"),
        new RequiredFieldRule(violation.violationTime, "Time of violation is required"),
        new RequiredFieldRule(violation.violationLocation, "Location is required"),
        new MaxLengthFieldRule(violation.violationLocation, 0, 100, "Location cannot be more than 100 characters"),
        new RequiredFieldRule(violation.violationCode, "Violation code is required"),
        new MaxLengthFieldRule(violation.violationCode, 0, 20, "Violation code cannot be more than 20 characters"),
        new MaxLengthFieldRule(violation.violationDescription, 0, 100, "Violation cannot be more than 100 characters"),

        new RequiredFieldRule(payment.paymentDueDate, "The date the fine must be paid on or before is required"),
        new NumberRangeFieldRule(payment.paymentAmountDue, 0, maximumAmountDue, "Amount due is not within the allowed range"),
        new NumberRangeFieldRule(payment.paymentIncreasedAmountDue, 0, maximumAmountDue, "Amount due after the court date is not within the allowed range"),

        new RequiredFieldRule(court.courtDate, "Court date is required"),

        // The license number is only asked of a vehicle carrying a plate, and whether it does is answered on the
        // detail page. A condition reads a field from another page through the form, so the two need not be
        // brought onto one page to be compared.
        new RequiredFieldRule(vehicle.vehicleLicenseNumber, "Vehicle license number is required unless the vehicle carries no plate")
            .when(new FieldValueCondition(vehicleDetail.vehicleNoLicensePlate, ComparisonOperator.notEquals, true)),
        CompositeRule.and(vehicle.vehicleLicenseNumber, field => [
            new MaxLengthFieldRule(field, 0, 20, "Vehicle license number cannot be more than 20 characters"),
            new PatternFieldRule(field, licensePlatePattern, "Vehicle license number can only contain letters, numbers, spaces or dashes")
        ]),
        new MaxLengthFieldRule(vehicle.vehicleMeterNumber, 0, 15, "Meter number cannot be more than 15 characters"),

        new RequiredFieldRule(officer.officerName, "Officer is required"),
        new RequiredFieldRule(officer.officerCommissionNumber, "Commission number is required"),
        new MaxLengthFieldRule(officer.officerCommissionNumber, 0, 10, "Commission number cannot be more than 10 characters"),

        new MaxLengthFieldRule(record.recordBeat, 0, 10, "Beat cannot be more than 10 characters"),
        new MaxLengthFieldRule(record.recordTribe, 0, 30, "Tribe cannot be more than 30 characters"),

        new MaxLengthFieldRule(owner.ownerFirstName, 0, 30, "First name cannot be more than 30 characters"),
        new MaxLengthFieldRule(owner.ownerMiddleName, 0, 30, "Middle name cannot be more than 30 characters"),
        new MaxLengthFieldRule(owner.ownerLastName, 0, 30, "Last name cannot be more than 30 characters"),
        new MaxLengthFieldRule(owner.ownerSuffix, 0, 5, "Suffix cannot be more than 5 characters"),
        new MaxLengthFieldRule(owner.ownerAddress, 0, 100, "Address cannot be more than 100 characters"),
        new MaxLengthFieldRule(owner.ownerCity, 0, 30, "City cannot be more than 30 characters"),
        new PatternFieldRule(owner.ownerZipCode, zipCodePattern, "Zip must be five digits, optionally followed by a four digit extension"),

        new PatternFieldRule(vehicleDetail.vehicleVin, vinPattern, "VIN must be 17 characters and cannot contain the letters I, O or Q"),
        new NumberRangeFieldRule(vehicleDetail.vehicleYear, earliestVehicleYear, new Date().getFullYear() + 1, "Vehicle year is not within the allowed range"),
        new MaxLengthFieldRule(vehicleDetail.vehicleType, 0, 20, "Type cannot be more than 20 characters"),
        new MaxLengthFieldRule(vehicleDetail.vehicleColor, 0, 20, "Color cannot be more than 20 characters"),
        new MaxLengthFieldRule(vehicleDetail.vehicleModel, 0, 30, "Model cannot be more than 30 characters")
    ]);
}
