import { IOptionValue } from "@forms/core";

/** The violation and payment boxes belonging to one violation, differing page to page. Date, time and location are held here alongside the code since the citation prints them in the same block; a ticket run writes the same three onto every page. */
export interface IOKParkingViolationData {
    /** "Amount Due" if paid on or before the court date, from the payment section of the citation page. */
    readonly paymentAmountDue?: number | null;
    /** The date the fine must be paid on or before, from the payment section of the citation page. Held as `YYYY-MM-DD`. */
    readonly paymentDueDate?: string;
    /** "Amount Due" once the court date has passed, from the payment section of the citation page. */
    readonly paymentIncreasedAmountDue?: number | null;
    /** The date after which the increased amount applies, from the payment section of the citation page. Held as `YYYY-MM-DD`. */
    readonly paymentIncreasedDueDate?: string;
    /** "Code", from the violation section of the citation page. */
    readonly violationCode?: string;
    /** "On (date)", from the violation section of the citation page. Held as `YYYY-MM-DD`. */
    readonly violationDate?: string;
    /** "Violation", from the violation section of the citation page. */
    readonly violationDescription?: string;
    /** "At or near (Location)", from the violation section of the citation page. */
    readonly violationLocation?: string;
    /** "At (time)", from the violation section of the citation page. */
    readonly violationTime?: string;
}

/** Represents the data contract for the Oklahoma City parking violation record. */
export interface IOKParkingData extends IOKParkingViolationData {
    /** The violations beyond the first, one per further citation page. The first stays in the flat fields, so a record written before a citation could carry more than one round-trips unchanged. */
    readonly additionalViolations?: ReadonlyArray<IOKParkingViolationData>;
    /** "Signature of Clerk", from the certification section of the complaint page. */
    readonly certificationClerkSignature?: string;
    /** "Date" the clerk certified the record, from the certification section of the complaint page. */
    readonly certificationDate?: string;
    /** "Citation Number", from the complaint section of the complaint page. */
    readonly complaintCitationNumber?: string;
    /** "Assistant Municipal Counselor" who found probable cause, from the complaint section of the complaint page. */
    readonly complaintCounselor?: string;
    /** "Date" the complaint was examined, from the complaint section of the complaint page. */
    readonly complaintDate?: string;
    /** "Court Date", from the court section of the citation page. Held as `YYYY-MM-DD`. */
    readonly courtDate?: string;
    /** "Court Time", from the court section of the citation page. */
    readonly courtTime?: string;
    /** "Offense Notes", from the notes section of the detail page. */
    readonly notesOffenseNotes?: string;
    /** "Officer Notes", from the notes section of the detail page. */
    readonly notesOfficerNotes?: string;
    /** "Comm. Number", from the officer section of the citation page. */
    readonly officerCommissionNumber?: string;
    /** "Officer", from the officer section of the citation page. */
    readonly officerName?: string;
    /** "Address", from the registered owner section of the detail page. */
    readonly ownerAddress?: string;
    /** "City", from the registered owner section of the detail page. */
    readonly ownerCity?: string;
    /** "First Name", from the registered owner section of the detail page. */
    readonly ownerFirstName?: string;
    /** "Last Name", from the registered owner section of the detail page. */
    readonly ownerLastName?: string;
    /** "Middle", from the registered owner section of the detail page. */
    readonly ownerMiddleName?: string;
    /** "State", from the registered owner section of the detail page. */
    readonly ownerState?: IOptionValue;
    /** "Suffix", from the registered owner section of the detail page. */
    readonly ownerSuffix?: string;
    /** "Zip", from the registered owner section of the detail page. */
    readonly ownerZipCode?: string;
    /** "Beat", from the record section of the detail page. */
    readonly recordBeat?: string;
    /** "Parking Citation Number", from the record section of the detail page. */
    readonly recordCitationNumber?: string;
    /** "County", from the record section of the detail page. */
    readonly recordCounty?: IOptionValue;
    /** "Tribe", from the record section of the detail page. */
    readonly recordTribe?: string;
    /** "Void Reason", from the record section of the detail page. */
    readonly recordVoidReason?: string;
    /** "Color", from the vehicle detail section of the detail page. */
    readonly vehicleColor?: string;
    /** "Vehicle License Number", from the vehicle section of the citation page. */
    readonly vehicleLicenseNumber?: string;
    /** "Vehicle Make", from the vehicle section of the citation page. */
    readonly vehicleMake?: IOptionValue;
    /** "Meter #", from the vehicle section of the citation page. */
    readonly vehicleMeterNumber?: string;
    /** "Model", from the vehicle detail section of the detail page. */
    readonly vehicleModel?: string;
    /** "No LP", whether the vehicle carries no license plate, from the vehicle detail section of the detail page. */
    readonly vehicleNoLicensePlate?: boolean;
    /** "Reg Exp", from the vehicle detail section of the detail page. */
    readonly vehicleRegistrationExpires?: string;
    /** "Type", from the vehicle detail section of the detail page. */
    readonly vehicleType?: string;
    /** "VIN", from the vehicle detail section of the detail page. */
    readonly vehicleVin?: string;
    /** "Veh Yr", from the vehicle detail section of the detail page. */
    readonly vehicleYear?: number | null;
    /** "APPROVED", whether a warrant was recommended, from the warrant section of the complaint page. */
    readonly warrantApproved?: boolean;
    /** "Assistant Municipal Counselor" who approved the warrant, from the warrant section of the complaint page. */
    readonly warrantCounselor?: string;
}
