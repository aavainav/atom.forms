import { IOptionValue } from "@forms/core";

/** Represents the data contract for the SC Form 432 (Public Contact / Warning) record. */
export interface IPublicContactOrWarningData {
    /** The city the issuing agency belongs to; at most 25 characters. */
    readonly agencyCity?: string;
    /** The county the issuing agency belongs to, as a code and its name; required. */
    readonly agencyCounty?: IOptionValue;
    /** The name of the agency making the contact. */
    readonly agencyName?: string;
    /** Checked when the contact was for changing lanes unlawfully. */
    readonly natureChangingLanesUnlawfully?: boolean;
    /** Checked when the contact was a contact only, carrying no violation. */
    readonly natureContactOnly?: boolean;
    /** Checked when the contact was for defective equipment. */
    readonly natureDefectiveEquipment?: boolean;
    /** Checked when the contact was for disregarding a stop sign. */
    readonly natureDisregardingStopSign?: boolean;
    /** Checked when the contact was for disregarding a traffic signal. */
    readonly natureDisregardingTrafficSignal?: boolean;
    /** Checked when the contact was for a driver's license violation. */
    readonly natureDriversLicenseViolation?: boolean;
    /** Checked when the contact was for failure to dim lights. */
    readonly natureFailureToDimLights?: boolean;
    /** Checked when the contact was for following too close. */
    readonly natureFollowingTooClose?: boolean;
    /** Checked when the contact was for a hands free violation. */
    readonly natureHandsFreeViolation?: boolean;
    /** Checked when the contact was an immigration stop. */
    readonly natureImmigrationStop?: boolean;
    /** Checked when the contact was for improper backing. */
    readonly natureImproperBacking?: boolean;
    /** Checked when the contact was for improper lane use. */
    readonly natureImproperLaneUse?: boolean;
    /** Checked when the contact was for improper lights. */
    readonly natureImproperLights?: boolean;
    /** Checked when the contact was for improper passing. */
    readonly natureImproperPassing?: boolean;
    /** Checked when the contact was for an improper turn. */
    readonly natureImproperTurn?: boolean;
    /** Checked when the contact was for failing to yield the right of way. */
    readonly natureNoRightOfWay?: boolean;
    /** Checked when the nature of the contact is none of the listed ones. */
    readonly natureOther?: boolean;
    /** The explanation for `natureOther`; required once it is checked, and at most 50 characters. */
    readonly natureOtherSpecify?: string;
    /** Checked when the contact was for a pedestrian violation. */
    readonly naturePedestrian?: boolean;
    /** Checked when the contact was for a seat belt violation. */
    readonly natureSeatBeltViolation?: boolean;
    /** Checked when the contact was for speeding. */
    readonly natureSpeeding?: boolean;
    /** Checked when the contact was for a vehicle license violation. */
    readonly natureVehicleLicenseViolation?: boolean;
    /** The name of the officer issuing the contact/warning; required, and at most 50 characters. */
    readonly officerIssuedBy?: string;
    /** The issuing officer's rank; required, and at most 6 characters. */
    readonly officerRank?: string;
    /** The issuing officer's South Carolina Criminal Justice Academy number; at most 10 characters. */
    readonly officerScCjaNumber?: string;
    /** The date of birth of the person contacted. */
    readonly personDateOfBirth?: string;
    /** The driver's license number of the person contacted; required, and at most 25 characters. */
    readonly personDriverLicenseNumber?: string;
    /** The first name of the person contacted; required, and at most 30 characters. */
    readonly personFirstName?: string;
    /** The gender of the person contacted, as a code and its description. */
    readonly personGender?: IOptionValue;
    /** The last name of the person contacted; required, and at most 30 characters. */
    readonly personLastName?: string;
    /** The latitude of the contact, as a signed decimal carrying exactly five decimal digits; required, and between -90 and 90. */
    readonly personLatitude?: string;
    /** The state that licensed the person contacted, as a code and its name; required. */
    readonly personLicensedState?: IOptionValue;
    /** The longitude of the contact, as a signed decimal carrying exactly five decimal digits; required, and between -180 and 180. */
    readonly personLongitude?: string;
    /** The middle initial of the person contacted; a single character. */
    readonly personMiddleInitial?: string;
    /** The race/ethnicity of the person contacted, as a code and its description; required. */
    readonly personRace?: IOptionValue;
    /** Checked when the contact was made on a BOLO. */
    readonly primaryReasonBolo?: boolean;
    /** Checked when the contact was made to assist a motorist. */
    readonly primaryReasonMotoristAssistance?: boolean;
    /** Checked when the contact was made for a moving violation. */
    readonly primaryReasonMovingViolation?: boolean;
    /** Checked when the contact was made for a non-moving violation. */
    readonly primaryReasonNonMovingViolation?: boolean;
    /** The explanation given when the primary reason is none of the listed ones. */
    readonly primaryReasonOtherSpecify?: string;
    /** Checked when the contact was made for suspicious activity. */
    readonly primaryReasonSuspiciousActivity?: boolean;
    /** Checked when the contact was made for a traffic collision. */
    readonly primaryReasonTrafficCollision?: boolean;
    /** The number or name of the route the contact took place on; required. */
    readonly routeNumberOrName?: string;
    /** The type of route the contact took place on, such as `US` or `SC`; required. */
    readonly routeType?: string;
    /**
     * The basis for the search when none of the listed bases applies; required once a search is recorded and no
     * listed basis is checked, so a record without a search never owes one. At most 50 characters.
     */
    readonly searchesBasisOtherSpecify?: string;
    /** Checked when consent to search was refused. */
    readonly searchesConsentGivenNo?: boolean;
    /** Checked when consent to search was given; paired with `searchesConsentGivenNo`, and a record answering neither leaves both false. */
    readonly searchesConsentGivenYes?: boolean;
    /** Checked when consent to search was not requested. */
    readonly searchesConsentRequestedNo?: boolean;
    /** Checked when consent to search was requested; paired with `searchesConsentRequestedNo`, and a record answering neither leaves both false. */
    readonly searchesConsentRequestedYes?: boolean;
    /** Checked when the search was made incident to an arrest. */
    readonly searchesIncidentToArrest?: boolean;
    /** Checked when the search was an inventory of a towed vehicle. */
    readonly searchesInventoryVehicleTowed?: boolean;
    /** Checked when the search was made by consent. */
    readonly searchesMadeByConsent?: boolean;
    /** Checked when the driver was searched. */
    readonly searchesOfDriver?: boolean;
    /** Checked when a passenger was searched. */
    readonly searchesOfPassenger?: boolean;
    /** Checked when a pedestrian was searched. */
    readonly searchesOfPedestrian?: boolean;
    /** Checked when the vehicle was searched. */
    readonly searchesOfVehicle?: boolean;
    /** Checked when the search was made on probable cause. */
    readonly searchesProbableCause?: boolean;
    /** The CAD call number for the contact; letters and digits only, and at most 15 characters. */
    readonly stopCadCallNumber?: string;
    /** The county the contact took place in, as a code and its name; required. */
    readonly stopCounty?: IOptionValue;
    /** The date of the contact. */
    readonly stopDate?: string;
    /** The time of the contact; required, and carried as free text since the form enforces no format of its own. */
    readonly stopTime?: string;
    /** Checked when the vehicle is a commercial motor vehicle. */
    readonly vehicleCmv?: boolean;
    /** The vehicle's license number; required, at most 20 characters, and letters, digits, spaces and dashes only. */
    readonly vehicleLicenseNumber?: string;
    /** The make of the vehicle, as a code and its name; required. */
    readonly vehicleMake?: IOptionValue;
    /** The model of the vehicle, as a code and its name. The models available are those belonging to `vehicleMake`. */
    readonly vehicleModel?: IOptionValue;
    /** The state that licensed the vehicle, as a code and its name; required. */
    readonly vehicleState?: IOptionValue;
    /** The model year of the vehicle; required. An unanswered year is left absent rather than reported as 0. */
    readonly vehicleYear?: number;
}
