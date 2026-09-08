/**
 * Represents one further violation the citation was written for, beyond the one the flat fields carry.
 *
 * The S438 prints one charge per ticket, so a stop producing three charges produces three front pages. The
 * violator, vehicle, owner, court, location and officer details are the same on all of them and stay flat on the
 * record; only these fields differ page to page.
 */
export interface IS438ViolationData {
    /** The blood alcohol level recorded for the violation. */
    readonly violationBloodAlcoholLevel?: string;
    /** Checked when no court appearance is required for the violation. */
    readonly violationCourtAppearanceRequiredNo?: boolean;
    /** Checked when a court appearance is required for the violation; paired with `violationCourtAppearanceRequiredNo`, and a record answering neither leaves both false. */
    readonly violationCourtAppearanceRequiredYes?: boolean;
    /** The date of the violation. */
    readonly violationDateOfViolation?: string;
    /** The description of the violation. */
    readonly violationDescription?: string;
    /** The South Carolina points the violation carries. */
    readonly violationScPoints?: number;
    /** The section number of the violation. */
    readonly violationSectionNumber?: string;
    /** The time of the violation. */
    readonly violationTimeOfViolation?: string;
}

/** Represents the data contract for the SC S438 (Uniform Traffic Ticket) citation record. */
export interface IS438Data {
    /**
     * The violations beyond the first, one per further front page the citation carries.
     *
     * The first violation stays in the flat `violation*` fields rather than being moved into this array, so a
     * record written before a citation could carry more than one charge round trips through here unchanged.
     */
    readonly additionalViolations?: ReadonlyArray<IS438ViolationData>;
    /** The bail deposited with the arresting officer. */
    readonly arrestingOfficerBailDeposited?: string;
    /** The bond amount the arresting officer requested. */
    readonly arrestingOfficerBondAmountRequested?: string;
    /** The date of the arrest. */
    readonly arrestingOfficerDateOfArrest?: string;
    /** The name of the arresting officer. */
    readonly arrestingOfficerName?: string;
    /** The arresting officer's rank. */
    readonly arrestingOfficerRank?: string;
    /** The arresting officer's South Carolina Criminal Justice Academy number. */
    readonly arrestingOfficerSccjaOfficerNumber?: string;
    /** The city of the trial court. */
    readonly courtCity?: string;
    /** The date of trial. */
    readonly courtDateOfTrial?: string;
    /** The name of the trial court. */
    readonly courtName?: string;
    /** The state of the trial court. */
    readonly courtState?: string;
    /** The street address of the trial court. */
    readonly courtStreetAddress?: string;
    /** The time of trial. */
    readonly courtTimeOfTrial?: string;
    /** The zip code of the trial court. */
    readonly courtZipCode?: string;
    /** The ticket number the citation was issued under. */
    readonly footerTicketNumber?: string;
    /** The city of the registered owner, when the owner is not the violator. */
    readonly ownerCity?: string;
    /** The first name of the registered owner, when the owner is not the violator. */
    readonly ownerFirstName?: string;
    /** The last name of the registered owner, when the owner is not the violator. */
    readonly ownerLastName?: string;
    /** The middle name of the registered owner, when the owner is not the violator. */
    readonly ownerMiddleName?: string;
    /** The state of the registered owner, when the owner is not the violator. */
    readonly ownerState?: string;
    /** The street address of the registered owner, when the owner is not the violator. */
    readonly ownerStreetAddress?: string;
    /** The zip code of the registered owner, when the owner is not the violator. */
    readonly ownerZipCode?: string;
    /** Checked when the vehicle is an automobile. */
    readonly vehicleAuto?: boolean;
    /** Checked when the vehicle is a bicycle. */
    readonly vehicleBicycle?: boolean;
    /** Checked when the vehicle is a combination vehicle. */
    readonly vehicleCombination?: boolean;
    /** Checked when the vehicle is a commercial vehicle. */
    readonly vehicleCommercialVehicle?: boolean;
    /** Checked when the vehicle was carrying hazardous materials. */
    readonly vehicleHazardousMaterials?: boolean;
    /** The vehicle's license plate number. */
    readonly vehicleLicenseNumber?: string;
    /** The state that issued the vehicle's plate. */
    readonly vehicleLicenseState?: string;
    /** The make of the vehicle. */
    readonly vehicleMake?: string;
    /** Checked when the vehicle is a moped. */
    readonly vehicleMoped?: boolean;
    /** Checked when the vehicle is a motorcycle. */
    readonly vehicleMotorcycle?: boolean;
    /** Checked when the vehicle is none of the listed types. */
    readonly vehicleOther?: boolean;
    /** Checked when the violator was a pedestrian rather than in a vehicle. */
    readonly vehiclePedestrian?: boolean;
    /** The model year of the vehicle. An unanswered year is left absent rather than reported as 0. */
    readonly vehicleYear?: number;
    /** The violator's blood alcohol level. */
    readonly violationBloodAlcoholLevel?: string;
    /** Checked when no court appearance is required for the violation. */
    readonly violationCourtAppearanceRequiredNo?: boolean;
    /** Checked when a court appearance is required for the violation; paired with `violationCourtAppearanceRequiredNo`, and a record answering neither leaves both false. */
    readonly violationCourtAppearanceRequiredYes?: boolean;
    /** The date of the violation. The form stamps today's date on a new citation, so data carrying a date overrides it. */
    readonly violationDateOfViolation?: string;
    /** The description of the violation. */
    readonly violationDescription?: string;
    /** The location the violation took place at. */
    readonly violationLocation?: string;
    /** The city the violation took place in. */
    readonly violationLocationCity?: string;
    /** The county the violation took place in. */
    readonly violationLocationCounty?: string;
    /** The latitude of the violation. */
    readonly violationLocationLatitude?: string;
    /** The longitude of the violation. */
    readonly violationLocationLongitude?: string;
    /** The South Carolina points the violation carries. */
    readonly violationScPoints?: number;
    /** The code section number of the violation. The form holds one violation, so a record carrying several supplies the one it is issued for. */
    readonly violationSectionNumber?: string;
    /** The time of the violation. */
    readonly violationTimeOfViolation?: string;
    /** The city of the violator. */
    readonly violatorCity?: string;
    /** Checked when the violator does not hold a commercial driver's license. */
    readonly violatorCommercialDriverLicenseNo?: boolean;
    /** Checked when the violator holds a commercial driver's license; paired with `violatorCommercialDriverLicenseNo`, and a record answering neither leaves both false. */
    readonly violatorCommercialDriverLicenseYes?: boolean;
    /** The violator's date of birth. */
    readonly violatorDateOfBirth?: string;
    /** The class of the violator's driver's license. */
    readonly violatorDriverLicenseClass?: string;
    /** The violator's driver's license number. */
    readonly violatorDriverLicenseNumber?: string;
    /** The state that issued the violator's driver's license. */
    readonly violatorDriverLicenseState?: string;
    /** The violator's eye color. */
    readonly violatorEyeColor?: string;
    /** The violator's first name; required by the form. */
    readonly violatorFirstName?: string;
    /** The violator's hair color. */
    readonly violatorHairColor?: string;
    /** The violator's height. */
    readonly violatorHeight?: string;
    /** The violator's last name; required by the form. */
    readonly violatorLastName?: string;
    /** The violator's middle name. */
    readonly violatorMiddleName?: string;
    /** The violator's race. */
    readonly violatorRace?: string;
    /** The violator's sex. */
    readonly violatorSex?: string;
    /** The violator's state. */
    readonly violatorState?: string;
    /** The violator's street address. */
    readonly violatorStreetAddress?: string;
    /** The violator's weight. */
    readonly violatorWeight?: number;
    /** The violator's zip code; at most 5 characters. */
    readonly violatorZipCode?: string;
}
