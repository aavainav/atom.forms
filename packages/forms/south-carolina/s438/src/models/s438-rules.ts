import {
    BooleanFieldModel,
    ComparisonOperator,
    CompositeCondition,
    DateRangeFieldRule,
    FieldDefinition,
    FieldValueCondition,
    MaxLengthFieldRule,
    NumberFieldModel,
    NumberRangeFieldRule,
    PatternFieldRule,
    RequiredFieldRule,
    RequiredSelectionRule,
    Rule,
    RuleCollection,
    StringFieldModel
} from "@forms/core";
import type { S438FormSchema } from "./s438-form-schema";
import { speedingStatutes, SpeedingRule } from "./speeding-rule";

/** Matches a date written `mm/dd/yyyy`, the format every date on the citation carries. */
export const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

/** Matches a military time written `hhmm`. */
export const militaryTimePattern = /^([01]\d|2[0-3])[0-5]\d$/;

/**
 * Matches a violation section number: a state statute, or a city or county ordinance beginning "ORD.". A statute is
 * title-chapter-section (`xx-xx-xxxx`, per SCDMV); the list the selector writes from also carries 3-digit chapters and
 * sections and subsections written every which way -- `16-11-0910 (A)`, `44-53-0370(E)(1)(A)1` -- so only the
 * numbers up front are checked, and whatever follows them is left alone.
 */
export const violationSectionPattern = /^(\d{2}-\d{2,3}-\d{3,4}(?![\d-]).*|ORD\..+)$/;

/** Matches a street that does not begin with a PO Box, which cannot be a violator's address. */
const notPoBoxPattern = /^(?!\s*(p\.?\s*o\.?|post\s+office)\s*box\b)/i;

/** Matches a height as 2 or 3 digits -- inches, or feet and inches run together (6'2" is 74 or 602). */
const heightPattern = /^\d{2,3}$/;

/** Matches any plate number but NONE, which the vehicle's none box stands for instead. */
const notNonePattern = /^(?!\s*none\s*$)/i;

/** Matches a signed decimal, the GPS format a coordinate is written in. */
const decimalPattern = /^-?\d+(\.\d+)?$/;

/** Matches a blood alcohol level written `x.xx`. */
const bloodAlcoholLevelPattern = /^\d\.\d{2}$/;

/** Matches an SCCJA officer number written `xxxx-xxxx`. */
const sccjaNumberPattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

/** The driver license classes that require a commercial driver license. */
const commercialClasses = ["A", "B", "C"];

/** The violator fields the rules read, named the same whichever copy of the ticket they come from. */
interface IViolatorFields {
    readonly firstName: FieldDefinition<StringFieldModel>;
    readonly middleName: FieldDefinition<StringFieldModel>;
    readonly lastName: FieldDefinition<StringFieldModel>;
    readonly streetAddress: FieldDefinition<StringFieldModel>;
    readonly city: FieldDefinition<StringFieldModel>;
    readonly state: FieldDefinition<StringFieldModel>;
    readonly zipCode: FieldDefinition<StringFieldModel>;
    readonly driverLicenseState: FieldDefinition<StringFieldModel>;
    readonly driverLicenseNumber: FieldDefinition<StringFieldModel>;
    readonly driverLicenseClass: FieldDefinition<StringFieldModel>;
    readonly commercialDriverLicenseYes: FieldDefinition<BooleanFieldModel>;
    readonly commercialDriverLicenseNo: FieldDefinition<BooleanFieldModel>;
    readonly race: FieldDefinition<StringFieldModel>;
    readonly sex: FieldDefinition<StringFieldModel>;
    readonly dateOfBirth: FieldDefinition<StringFieldModel>;
    readonly height: FieldDefinition<StringFieldModel>;
    readonly weight: FieldDefinition<NumberFieldModel>;
    readonly hairColor: FieldDefinition<StringFieldModel>;
    readonly eyeColor: FieldDefinition<StringFieldModel>;
}

/** The vehicle fields the rules read. */
interface IVehicleFields {
    readonly licenseNumber: FieldDefinition<StringFieldModel>;
    readonly licenseState: FieldDefinition<StringFieldModel>;
    readonly make: FieldDefinition<StringFieldModel>;
    readonly year: FieldDefinition<NumberFieldModel>;
    readonly types: ReadonlyArray<FieldDefinition<BooleanFieldModel>>;
    readonly combination: FieldDefinition<BooleanFieldModel>;
    readonly pedestrian: FieldDefinition<BooleanFieldModel>;
}

/** The owner fields the rules read. */
interface IOwnerFields {
    readonly firstName: FieldDefinition<StringFieldModel>;
    readonly middleName: FieldDefinition<StringFieldModel>;
    readonly lastName: FieldDefinition<StringFieldModel>;
    readonly streetAddress: FieldDefinition<StringFieldModel>;
    readonly city: FieldDefinition<StringFieldModel>;
    readonly state: FieldDefinition<StringFieldModel>;
    readonly zipCode: FieldDefinition<StringFieldModel>;
}

/** The trial court fields the rules read. */
interface ICourtFields {
    readonly courtName: FieldDefinition<StringFieldModel>;
    readonly streetAddress: FieldDefinition<StringFieldModel>;
    readonly dateOfTrial: FieldDefinition<StringFieldModel>;
    readonly timeOfTrial: FieldDefinition<StringFieldModel>;
    readonly city: FieldDefinition<StringFieldModel>;
    readonly state: FieldDefinition<StringFieldModel>;
    readonly zipCode: FieldDefinition<StringFieldModel>;
}

/** The violation fields the rules read. */
interface IViolationFields {
    readonly sectionNumber: FieldDefinition<StringFieldModel>;
    readonly description: FieldDefinition<StringFieldModel>;
    readonly dateOfViolation: FieldDefinition<StringFieldModel>;
    readonly timeOfViolation: FieldDefinition<StringFieldModel>;
    readonly bloodAlcoholLevel: FieldDefinition<StringFieldModel>;
    readonly speed: FieldDefinition<NumberFieldModel>;
    readonly speedLimit: FieldDefinition<NumberFieldModel>;
}

/** The violation location fields the rules read. */
interface IViolationLocationFields {
    readonly location: FieldDefinition<StringFieldModel>;
    readonly county: FieldDefinition<StringFieldModel>;
    readonly latitude: FieldDefinition<StringFieldModel>;
    readonly longitude: FieldDefinition<StringFieldModel>;
}

/** The arresting officer fields the rules read. */
interface IArrestingOfficerFields {
    readonly rank: FieldDefinition<StringFieldModel>;
    readonly sccjaOfficerNumber: FieldDefinition<StringFieldModel>;
    readonly bailDeposited: FieldDefinition<StringFieldModel>;
    readonly dateOfArrest: FieldDefinition<StringFieldModel>;
    readonly bondAmountRequested: FieldDefinition<StringFieldModel>;
}

/** Which of the rules a copy of the ticket can take; the front page does not yet draw race, sex or the vehicle types, so a rule on them could never be satisfied there. */
interface ITicketOptions {
    readonly drawsRaceAndSex: boolean;
    readonly drawsVehicleTypes: boolean;
    /** The copy's disposition date, if it has one: the court records a disposition after the trial, when the date of trial has passed, so that date must be in the future only until then. */
    readonly dispositionDate?: FieldDefinition<StringFieldModel>;
}

/** Builds the validation rules for the SC S438 (Uniform Traffic Ticket): the front page's, the same again for the trial copy's own fields, and the court's. */
export function createRuleCollection(schema: S438FormSchema): RuleCollection {
    const violator = schema.violatorFields;
    const vehicle = schema.vehicleFields;
    const owner = schema.ownerFields;
    const court = schema.courtFields;
    const violation = schema.violationFields;
    const location = schema.violationLocationFields;
    const officer = schema.arrestingOfficerFields;

    const trialViolator = schema.trialViolatorFields;
    const trialVehicle = schema.trialVehicleFields;
    const trialOwner = schema.trialOwnerFields;
    const trialCourt = schema.trialCourtFields;
    const trialViolation = schema.trialViolationFields;
    const trialLocation = schema.trialViolationLocationFields;
    const trialOfficer = schema.trialArrestingOfficerFields;

    const front = createTicketRules({
        violator: {
            firstName: violator.violatorFirstName,
            middleName: violator.violatorMiddleName,
            lastName: violator.violatorLastName,
            streetAddress: violator.violatorStreetAddress,
            city: violator.violatorCity,
            state: violator.violatorState,
            zipCode: violator.violatorZipCode,
            driverLicenseState: violator.violatorDriverLicenseState,
            driverLicenseNumber: violator.violatorDriverLicenseNumber,
            driverLicenseClass: violator.violatorDriverLicenseClass,
            commercialDriverLicenseYes: violator.violatorCommercialDriverLicenseYes,
            commercialDriverLicenseNo: violator.violatorCommercialDriverLicenseNo,
            race: violator.violatorRace,
            sex: violator.violatorSex,
            dateOfBirth: violator.violatorDateOfBirth,
            height: violator.violatorHeight,
            weight: violator.violatorWeight,
            hairColor: violator.violatorHairColor,
            eyeColor: violator.violatorEyeColor
        },
        vehicle: {
            licenseNumber: vehicle.vehicleLicenseNumber,
            licenseState: vehicle.vehicleLicenseState,
            make: vehicle.vehicleMake,
            year: vehicle.vehicleYear,
            types: [vehicle.vehicleAuto, vehicle.vehicleBicycle, vehicle.vehicleCombination, vehicle.vehicleCommercialVehicle, vehicle.vehicleHazardousMaterials, vehicle.vehicleMoped, vehicle.vehicleMotorcycle, vehicle.vehiclePedestrian, vehicle.vehicleOther],
            combination: vehicle.vehicleCombination,
            pedestrian: vehicle.vehiclePedestrian
        },
        owner: {
            firstName: owner.ownerFirstName,
            middleName: owner.ownerMiddleName,
            lastName: owner.ownerLastName,
            streetAddress: owner.ownerStreetAddress,
            city: owner.ownerCity,
            state: owner.ownerState,
            zipCode: owner.ownerZipCode
        },
        court: {
            courtName: court.courtName,
            streetAddress: court.courtStreetAddress,
            dateOfTrial: court.courtDateOfTrial,
            timeOfTrial: court.courtTimeOfTrial,
            city: court.courtCity,
            state: court.courtState,
            zipCode: court.courtZipCode
        },
        violation: {
            sectionNumber: violation.violationSectionNumber,
            description: violation.violationDescription,
            dateOfViolation: violation.violationDateOfViolation,
            timeOfViolation: violation.violationTimeOfViolation,
            bloodAlcoholLevel: violation.violationBloodAlcoholLevel,
            speed: violation.violationSpeed,
            speedLimit: violation.violationSpeedLimit
        },
        location: {
            location: location.violationLocation,
            county: location.violationLocationCounty,
            latitude: location.violationLocationLatitude,
            longitude: location.violationLocationLongitude
        },
        officer: {
            rank: officer.arrestingOfficerRank,
            sccjaOfficerNumber: officer.arrestingOfficerSccjaOfficerNumber,
            bailDeposited: officer.arrestingOfficerBailDeposited,
            dateOfArrest: officer.arrestingOfficerDateOfArrest,
            bondAmountRequested: officer.arrestingOfficerBondAmountRequested
        },
        ticketNumber: schema.footerFields.footerTicketNumber
    }, { drawsRaceAndSex: false, drawsVehicleTypes: false });

    const trial = createTicketRules({
        violator: {
            firstName: trialViolator.trialViolatorFirstName,
            middleName: trialViolator.trialViolatorMiddleName,
            lastName: trialViolator.trialViolatorLastName,
            streetAddress: trialViolator.trialViolatorStreetAddress,
            city: trialViolator.trialViolatorCity,
            state: trialViolator.trialViolatorState,
            zipCode: trialViolator.trialViolatorZipCode,
            driverLicenseState: trialViolator.trialViolatorDriverLicenseState,
            driverLicenseNumber: trialViolator.trialViolatorDriverLicenseNumber,
            driverLicenseClass: trialViolator.trialViolatorDriverLicenseClass,
            commercialDriverLicenseYes: trialViolator.trialViolatorCommercialDriverLicenseYes,
            commercialDriverLicenseNo: trialViolator.trialViolatorCommercialDriverLicenseNo,
            race: trialViolator.trialViolatorRace,
            sex: trialViolator.trialViolatorSex,
            dateOfBirth: trialViolator.trialViolatorDateOfBirth,
            height: trialViolator.trialViolatorHeight,
            weight: trialViolator.trialViolatorWeight,
            hairColor: trialViolator.trialViolatorHairColor,
            eyeColor: trialViolator.trialViolatorEyeColor
        },
        vehicle: {
            licenseNumber: trialVehicle.trialVehicleLicenseNumber,
            licenseState: trialVehicle.trialVehicleLicenseState,
            make: trialVehicle.trialVehicleMake,
            year: trialVehicle.trialVehicleYear,
            types: [trialVehicle.trialVehicleAuto, trialVehicle.trialVehicleBicycle, trialVehicle.trialVehicleCombination, trialVehicle.trialVehicleCommercialVehicle, trialVehicle.trialVehicleHazardousMaterials, trialVehicle.trialVehicleMoped, trialVehicle.trialVehicleMotorcycle, trialVehicle.trialVehiclePedestrian, trialVehicle.trialVehicleOther],
            combination: trialVehicle.trialVehicleCombination,
            pedestrian: trialVehicle.trialVehiclePedestrian
        },
        owner: {
            firstName: trialOwner.trialOwnerFirstName,
            middleName: trialOwner.trialOwnerMiddleName,
            lastName: trialOwner.trialOwnerLastName,
            streetAddress: trialOwner.trialOwnerStreetAddress,
            city: trialOwner.trialOwnerCity,
            state: trialOwner.trialOwnerState,
            zipCode: trialOwner.trialOwnerZipCode
        },
        court: {
            courtName: trialCourt.trialCourtName,
            streetAddress: trialCourt.trialCourtStreetAddress,
            dateOfTrial: trialCourt.trialCourtDateOfTrial,
            timeOfTrial: trialCourt.trialCourtTimeOfTrial,
            city: trialCourt.trialCourtCity,
            state: trialCourt.trialCourtState,
            zipCode: trialCourt.trialCourtZipCode
        },
        violation: {
            sectionNumber: trialViolation.trialViolationSectionNumber,
            description: trialViolation.trialViolationDescription,
            dateOfViolation: trialViolation.trialViolationDateOfViolation,
            timeOfViolation: trialViolation.trialViolationTimeOfViolation,
            bloodAlcoholLevel: trialViolation.trialViolationBloodAlcoholLevel,
            speed: trialViolation.trialViolationSpeed,
            speedLimit: trialViolation.trialViolationSpeedLimit
        },
        location: {
            location: trialLocation.trialViolationLocation,
            county: trialLocation.trialViolationLocationCounty,
            latitude: trialLocation.trialViolationLocationLatitude,
            longitude: trialLocation.trialViolationLocationLongitude
        },
        officer: {
            rank: trialOfficer.trialArrestingOfficerRank,
            sccjaOfficerNumber: trialOfficer.trialArrestingOfficerSccjaOfficerNumber,
            bailDeposited: trialOfficer.trialArrestingOfficerBailDeposited,
            dateOfArrest: trialOfficer.trialArrestingOfficerDateOfArrest,
            bondAmountRequested: trialOfficer.trialArrestingOfficerBondAmountRequested
        },
        ticketNumber: schema.trialFooterFields.trialFooterTicketNumber
    }, { drawsRaceAndSex: true, drawsVehicleTypes: true, dispositionDate: schema.trialCourtInformationFields.trialCourtInformationDispositionDate });

    return new RuleCollection([...front, ...trial, ...createCourtRules(schema)]);
}

/** The fields one copy of the ticket carries, which the same rules apply to whichever copy it is. */
interface ITicketFields {
    readonly violator: IViolatorFields;
    readonly vehicle: IVehicleFields;
    readonly owner: IOwnerFields;
    readonly court: ICourtFields;
    readonly violation: IViolationFields;
    readonly location: IViolationLocationFields;
    readonly officer: IArrestingOfficerFields;
    readonly ticketNumber: FieldDefinition<StringFieldModel>;
}

/** Builds the rules for one copy of the ticket. */
function createTicketRules(fields: ITicketFields, options: ITicketOptions): Array<Rule> {
    return [
        ...createViolatorRules(fields.violator, options),
        ...createVehicleRules(fields.vehicle, options),
        ...createOwnerRules(fields.owner, fields.vehicle.pedestrian),
        ...createCourtAddressRules(fields.court, options.dispositionDate),
        ...createViolationRules(fields.violation),
        ...createViolationLocationRules(fields.location),
        ...createArrestingOfficerRules(fields.officer),
        new MaxLengthFieldRule(fields.ticketNumber, 0, 14, "Ticket number cannot be more than 14 characters")
    ];
}

function createViolatorRules(violator: IViolatorFields, options: ITicketOptions): Array<Rule> {
    const hasLicenseNumber = new FieldValueCondition(violator.driverLicenseNumber, ComparisonOperator.isNotEmpty);
    const isCommercialClass = CompositeCondition.any(...commercialClasses.flatMap(licenseClass => [
        new FieldValueCondition(violator.driverLicenseClass, ComparisonOperator.equals, licenseClass),
        new FieldValueCondition(violator.driverLicenseClass, ComparisonOperator.equals, licenseClass.toLowerCase())
    ]));

    const rules: Array<Rule> = [
        new RequiredFieldRule(violator.firstName, "Name is required"),
        new MaxLengthFieldRule(violator.firstName, 0, 25, "First name cannot be more than 25 characters"),
        new MaxLengthFieldRule(violator.middleName, 0, 10, "Middle name cannot be more than 10 characters"),
        new RequiredFieldRule(violator.lastName, "Name is required"),
        new MaxLengthFieldRule(violator.lastName, 0, 30, "Last name cannot be more than 30 characters"),
        new MaxLengthFieldRule(violator.streetAddress, 0, 45, "Street cannot be more than 45 characters"),
        new PatternFieldRule(violator.streetAddress, notPoBoxPattern, "Violator street address must not be a PO Box"),
        new RequiredFieldRule(violator.city, "City is required"),
        new MaxLengthFieldRule(violator.city, 0, 20, "City cannot be more than 20 characters"),
        new RequiredFieldRule(violator.state, "State is required"),
        new MaxLengthFieldRule(violator.state, 0, 2, "State cannot be more than 2 characters"),
        new RequiredFieldRule(violator.zipCode, "Zip code is required"),
        new MaxLengthFieldRule(violator.zipCode, 0, 10, "Zip code cannot be more than 10 characters"),
        new RequiredFieldRule(violator.driverLicenseState, "DL state is required when a license number is entered").when(hasLicenseNumber),
        new MaxLengthFieldRule(violator.driverLicenseState, 0, 2, "DL state cannot be more than 2 characters"),
        new MaxLengthFieldRule(violator.driverLicenseNumber, 0, 20, "Driver's license number cannot be more than 20 characters"),
        new RequiredFieldRule(violator.driverLicenseClass, "DL class is required when a license number is entered").when(hasLicenseNumber),
        new MaxLengthFieldRule(violator.driverLicenseClass, 0, 3, "DL class cannot be more than 3 characters"),
        new RequiredSelectionRule(violator.commercialDriverLicenseYes, [violator.commercialDriverLicenseYes, violator.commercialDriverLicenseNo], "Choose Yes or No for CDL"),
        new RequiredFieldRule(violator.commercialDriverLicenseYes, "CDL should be Yes when the driver license class is A, B or C").when(isCommercialClass),
        new RequiredFieldRule(violator.dateOfBirth, "DOB is required"),
        new PatternFieldRule(violator.dateOfBirth, datePattern, "DOB must be formatted mm/dd/yyyy"),
        DateRangeFieldRule.notInFuture(violator.dateOfBirth, "DOB cannot be in the future"),
        new RequiredFieldRule(violator.height, "Height is required"),
        new PatternFieldRule(violator.height, heightPattern, "Height must be 2 or 3 digits, e.g. 74 or 602 for 6'2\""),
        new RequiredFieldRule(violator.weight, "Weight is required"),
        new NumberRangeFieldRule(violator.weight, 25, 999, "Weight must be between 25 and 999 lbs."),
        new MaxLengthFieldRule(violator.hairColor, 0, 3, "Hair cannot be more than 3 characters"),
        new MaxLengthFieldRule(violator.eyeColor, 0, 3, "Eyes cannot be more than 3 characters")
    ];

    if (options.drawsRaceAndSex) {
        rules.push(
            new RequiredFieldRule(violator.race, "Race is required"),
            new MaxLengthFieldRule(violator.race, 0, 2, "Race cannot be more than 2 characters"),
            new RequiredFieldRule(violator.sex, "Sex is required"),
            new MaxLengthFieldRule(violator.sex, 0, 1, "Sex cannot be more than 1 character"));
    }

    return rules;
}

function createVehicleRules(vehicle: IVehicleFields, options: ITicketOptions): Array<Rule> {
    const isVehicleInvolved = new FieldValueCondition(vehicle.pedestrian, ComparisonOperator.equals, false);

    const rules: Array<Rule> = [
        new RequiredFieldRule(vehicle.licenseNumber, "Vehicle license number is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(vehicle.licenseNumber, 0, 10, "Vehicle license number cannot be more than 10 characters"),
        new PatternFieldRule(vehicle.licenseNumber, notNonePattern, "Vehicle license number cannot be NONE"),
        new RequiredFieldRule(vehicle.licenseState, "Vehicle state is required when a license number is entered")
            .when(new FieldValueCondition(vehicle.licenseNumber, ComparisonOperator.isNotEmpty)),
        new MaxLengthFieldRule(vehicle.licenseState, 0, 2, "Vehicle state cannot be more than 2 characters"),
        new RequiredFieldRule(vehicle.make, "Make of vehicle is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(vehicle.make, 0, 4, "Make of vehicle cannot be more than 4 characters"),
        new RequiredFieldRule(vehicle.year, "Vehicle year is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(vehicle.year, 4, 4, "Vehicle year must be four characters long.")
    ];

    if (options.drawsVehicleTypes) {
        const otherTypes = vehicle.types.filter(type => type !== vehicle.combination);

        rules.push(
            new RequiredSelectionRule(vehicle.types[0], vehicle.types, "At least one vehicle type is required"),
            RequiredSelectionRule.atLeast(vehicle.combination, otherTypes, 2, "Choose two other vehicle types with Comb.")
                .when(new FieldValueCondition(vehicle.combination, ComparisonOperator.equals, true)));
    }

    return rules;
}

/** The owner is asked for only when a vehicle is involved -- that is, when the violator was not a pedestrian. */
function createOwnerRules(owner: IOwnerFields, pedestrian: FieldDefinition<BooleanFieldModel>): Array<Rule> {
    const isVehicleInvolved = new FieldValueCondition(pedestrian, ComparisonOperator.equals, false);

    return [
        new RequiredFieldRule(owner.firstName, "Owner first name is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.firstName, 0, 25, "Owner first name cannot be more than 25 characters"),
        new RequiredFieldRule(owner.middleName, "Owner middle name is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.middleName, 0, 10, "Owner middle name cannot be more than 10 characters"),
        new RequiredFieldRule(owner.lastName, "Owner last name is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.lastName, 0, 30, "Owner last name cannot be more than 30 characters"),
        new RequiredFieldRule(owner.streetAddress, "Owner street is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.streetAddress, 2, 40, "The field Street must be a string with a minimum length of 2 and a maximum length of 40"),
        new RequiredFieldRule(owner.city, "Owner city is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.city, 0, 20, "Owner city cannot be more than 20 characters"),
        new RequiredFieldRule(owner.state, "Owner state is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.state, 0, 2, "Owner state cannot be more than 2 characters"),
        new RequiredFieldRule(owner.zipCode, "Owner zip code is required").when(isVehicleInvolved),
        new MaxLengthFieldRule(owner.zipCode, 0, 10, "Owner zip code cannot be more than 10 characters")
    ];
}

function createCourtAddressRules(court: ICourtFields, dispositionDate?: FieldDefinition<StringFieldModel>): Array<Rule> {
    const trialDateInFuture = DateRangeFieldRule.inFuture(court.dateOfTrial, "Date of trial must be in the future");

    return [
        new MaxLengthFieldRule(court.courtName, 0, 50, "Name of trial court cannot be more than 50 characters"),
        new MaxLengthFieldRule(court.streetAddress, 0, 50, "Court street cannot be more than 50 characters"),
        new PatternFieldRule(court.dateOfTrial, datePattern, "Date of trial must be formatted mm/dd/yyyy"),
        dispositionDate ? trialDateInFuture.when(new FieldValueCondition(dispositionDate, ComparisonOperator.isEmpty)) : trialDateInFuture,
        new PatternFieldRule(court.timeOfTrial, militaryTimePattern, "Time of trial must be in military format, hhmm"),
        new MaxLengthFieldRule(court.city, 0, 30, "Court city cannot be more than 30 characters"),
        new PatternFieldRule(court.state, /^SC$/, "Court address state code must be SC"),
        new MaxLengthFieldRule(court.zipCode, 0, 10, "Court zip code cannot be more than 10 characters")
    ];
}

function createViolationRules(violation: IViolationFields): Array<Rule> {
    const isSpeeding = CompositeCondition.any(...Object.keys(speedingStatutes).map(statute =>
        new FieldValueCondition(violation.sectionNumber, ComparisonOperator.equals, statute)));

    return [
        new RequiredFieldRule(violation.speed, "Recorded speed is required for a speeding violation").when(isSpeeding),
        new NumberRangeFieldRule(violation.speed, 0, 999, "Recorded speed cannot be more than 3 digits"),
        new RequiredFieldRule(violation.speedLimit, "Speed limit is required for a speeding violation").when(isSpeeding),
        new NumberRangeFieldRule(violation.speedLimit, 0, 99, "Speed limit cannot be more than 2 digits"),
        new SpeedingRule(violation.sectionNumber, violation.speed, violation.speedLimit),
        new MaxLengthFieldRule(violation.sectionNumber, 0, 30, "Violation section number cannot be more than 30 characters"),
        new PatternFieldRule(violation.sectionNumber, violationSectionPattern, "Violation section number must be a statute (xx-xx-xxxx) or an ordinance beginning ORD."),
        new MaxLengthFieldRule(violation.description, 0, 150, "Violation description cannot be more than 150 characters"),
        new PatternFieldRule(violation.dateOfViolation, datePattern, "Date of violation must be formatted mm/dd/yyyy"),
        new PatternFieldRule(violation.timeOfViolation, militaryTimePattern, "Time of violation must be in military format, hhmm"),
        new PatternFieldRule(violation.bloodAlcoholLevel, bloodAlcoholLevelPattern, "B.A. level must be formatted x.xx")
    ];
}

function createViolationLocationRules(location: IViolationLocationFields): Array<Rule> {
    return [
        new RequiredFieldRule(location.location, "Violation location is required"),
        new MaxLengthFieldRule(location.location, 0, 50, "Violation location cannot be more than 50 characters"),
        new MaxLengthFieldRule(location.county, 0, 2, "County cannot be more than 2 characters"),
        new MaxLengthFieldRule(location.latitude, 0, 8, "Latitude cannot be more than 8 characters"),
        new PatternFieldRule(location.latitude, decimalPattern, "Latitude must be in GPS decimal format"),
        new NumberRangeFieldRule(location.latitude, 32, 35.3, "Latitude must be within South Carolina"),
        new MaxLengthFieldRule(location.longitude, 0, 9, "Longitude cannot be more than 9 characters"),
        new PatternFieldRule(location.longitude, decimalPattern, "Longitude must be in GPS decimal format"),
        new NumberRangeFieldRule(location.longitude, -83.4, -78.5, "Longitude must be within South Carolina")
    ];
}

function createArrestingOfficerRules(officer: IArrestingOfficerFields): Array<Rule> {
    return [
        new MaxLengthFieldRule(officer.rank, 0, 6, "Rank cannot be more than 6 characters"),
        new PatternFieldRule(officer.sccjaOfficerNumber, sccjaNumberPattern, "SCCJA officer number must be formatted xxxx-xxxx"),
        new RequiredFieldRule(officer.bailDeposited, "Bail deposited is required"),
        new MaxLengthFieldRule(officer.bailDeposited, 0, 5, "Bail deposited cannot be more than 5 characters"),
        new PatternFieldRule(officer.dateOfArrest, datePattern, "Date of arrest must be formatted mm/dd/yyyy"),
        new MaxLengthFieldRule(officer.bondAmountRequested, 0, 6, "Bond amount requested cannot be more than 6 characters")
    ];
}

/** The rules for what only the trial copy carries: its notes, when the bail was received, and the court's disposition. */
function createCourtRules(schema: S438FormSchema): Array<Rule> {
    const information = schema.trialCourtInformationFields;
    const officer = schema.trialArrestingOfficerFields;
    const caseBefore = [
        information.trialCourtInformationCaseBeforeMagistrate,
        information.trialCourtInformationCaseBeforeMunicipalCourt,
        information.trialCourtInformationCaseBeforeCircuitCourt,
        information.trialCourtInformationCaseBeforeFamilyCourt,
        information.trialCourtInformationCaseBeforeFederalCourt
    ];

    return [
        new MaxLengthFieldRule(schema.trialHeaderFields.trialHeaderNotes, 0, 50, "Notes cannot be more than 50 characters"),
        new PatternFieldRule(officer.trialArrestingOfficerDateBailReceived, datePattern, "Date bail received must be formatted mm/dd/yyyy"),
        new MaxLengthFieldRule(officer.trialArrestingOfficerBailReceivedBy, 0, 50, "By cannot be more than 50 characters"),
        // the court fills this in, so it is asked for only once the court has recorded a disposition -- until then the
        // citation is still the officer's, who has no answer to give
        new RequiredSelectionRule(caseBefore[0], caseBefore, "Choose the court the case went before")
            .when(new FieldValueCondition(information.trialCourtInformationDispositionDate, ComparisonOperator.isNotEmpty)),
        new MaxLengthFieldRule(information.trialCourtInformationCourtIfDifferent, 0, 50, "Name of the trial court cannot be more than 50 characters"),
        new PatternFieldRule(information.trialCourtInformationDispositionDate, datePattern, "Disposition date must be formatted mm/dd/yyyy"),
        new MaxLengthFieldRule(information.trialCourtInformationJail, 0, 4, "Jail cannot be more than 4 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationSuspend, 0, 6, "Suspended cannot be more than 6 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationFine, 0, 10, "Fine cannot be more than 10 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationAmountCollected, 0, 10, "Amount collected cannot be more than 10 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationAmountSuspended, 0, 10, "Amount suspended cannot be more than 10 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationCommittedTo, 0, 50, "Committed to cannot be more than 50 characters"),
        new MaxLengthFieldRule(information.trialCourtInformationCertifiedCorrect, 0, 50, "Certified correct cannot be more than 50 characters"),
        new PatternFieldRule(information.trialCourtInformationCertifiedDate, datePattern, "Date must be formatted mm/dd/yyyy")
    ];
}
