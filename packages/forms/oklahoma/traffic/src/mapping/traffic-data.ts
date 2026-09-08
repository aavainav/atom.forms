import { IOptionValue } from "@forms/core";

/** Represents the data contract for the Oklahoma City traffic citation record. */
export interface IOKTrafficData {
    /** "Arraignment Court Date", from the arraignment section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly arraignmentCourtDate?: string;
    /** "Time" of the arraignment, from the arraignment section of the complaint page. */
    readonly arraignmentCourtTime?: string;
    /** "Signature" of the defendant promising to appear, from the arraignment section of the complaint page. */
    readonly arraignmentDefendantSignature?: string;
    /** "Signature of Clerk", from the certification section of the warrant page. */
    readonly certificationClerkSignature?: string;
    /** "Date" the clerk certified the record, from the certification section of the warrant page. */
    readonly certificationDate?: string;
    /** "Citation Number", from the complaint section of the warrant page. */
    readonly complaintCitationNumber?: string;
    /** "Assistant Municipal Counselor" who found probable cause, from the complaint section of the warrant page. */
    readonly complaintCounselor?: string;
    /** "Date" the complaint was examined, from the complaint section of the warrant page. */
    readonly complaintDate?: string;
    /** "Address", from the defendant section of the complaint page. */
    readonly defendantAddress?: string;
    /** "City", from the defendant section of the complaint page. */
    readonly defendantCity?: string;
    /** "First", from the defendant section of the complaint page. */
    readonly defendantFirstName?: string;
    /** "Last", from the defendant section of the complaint page. */
    readonly defendantLastName?: string;
    /** "Middle", from the defendant section of the complaint page. */
    readonly defendantMiddleName?: string;
    /** "State", from the defendant section of the complaint page. */
    readonly defendantState?: IOptionValue;
    /** "Zip", from the defendant section of the complaint page. */
    readonly defendantZipCode?: string;
    /** "DOB", from the description section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly descriptionDateOfBirth?: string;
    /** The ethnicity half of "RACE/ETH", from the description section of the complaint page. */
    readonly descriptionEthnicity?: string;
    /** "HT", written as feet and inches such as `5-11`, from the description section of the complaint page. */
    readonly descriptionHeight?: string;
    /** The race half of "RACE/ETH", from the description section of the complaint page. */
    readonly descriptionRace?: string;
    /** "SEX", from the description section of the complaint page. */
    readonly descriptionSex?: IOptionValue;
    /** "WT" in pounds, from the description section of the complaint page. */
    readonly descriptionWeight?: number;
    /** "Citation Number" printed at the head of the complaint page. */
    readonly headerCitationNumber?: string;
    /** "CLASS", from the driver license section of the complaint page. */
    readonly licenseClass?: string;
    /** "ENDMTS", from the driver license section of the complaint page. */
    readonly licenseEndorsements?: string;
    /** "DL EXPIRE", from the driver license section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly licenseExpires?: string;
    /** "ID", the driver license number, from the driver license section of the complaint page. */
    readonly licenseIdentifier?: string;
    /** "STATE" that issued the license, from the driver license section of the complaint page. */
    readonly licenseState?: IOptionValue;
    /** "Officer Notes", from the notes section of the supplement page. */
    readonly notesOfficerNotes?: string;
    /** "Amount Due" if paid on or before the arraignment date, from the offense section of the complaint page. */
    readonly offenseAmountDue?: number;
    /** The date the fine must be paid on or before, from the offense section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly offenseDueDate?: string;
    /** "OFFENSE NOTES", from the offense section of the complaint page. */
    readonly offenseNotes?: string;
    /** "BWC Video" for the issuing officer, from the officer section of the complaint page. */
    readonly officerBodyWornCamera?: IOptionValue;
    /** "Comm. Number" of the issuing officer, from the officer section of the complaint page. */
    readonly officerCommissionNumber?: string;
    /** "Complainant Signature", from the officer section of the complaint page. */
    readonly officerComplainantSignature?: string;
    /** "Officer", the issuing officer, from the officer section of the complaint page. */
    readonly officerName?: string;
    /** "BWC Video" for the second officer, from the officer section of the complaint page. */
    readonly officerSecondBodyWornCamera?: IOptionValue;
    /** "Comm. Number" of the second officer, from the officer section of the complaint page. */
    readonly officerSecondCommissionNumber?: string;
    /** "Officer #2", from the officer section of the complaint page. */
    readonly officerSecondName?: string;
    /** "Address" of the registered owner, from the registered owner section of the supplement page. */
    readonly ownerAddress?: string;
    /** "City" of the registered owner, from the registered owner section of the supplement page. */
    readonly ownerCity?: string;
    /** "Name" of the registered owner, from the registered owner section of the supplement page. */
    readonly ownerName?: string;
    /** "Same as Suspect", whether the registered owner is the defendant, from the supplement page. */
    readonly ownerSameAsSuspect?: IOptionValue;
    /** "State" of the registered owner, from the registered owner section of the supplement page. */
    readonly ownerState?: IOptionValue;
    /** "Zip" of the registered owner, from the registered owner section of the supplement page. */
    readonly ownerZipCode?: string;
    /** "Assignment", from the status section of the supplement page. */
    readonly statusAssignment?: string;
    /** "CZ/WP", whether the offense occurred in a construction or work zone, from the supplement page. */
    readonly statusConstructionWorkZone?: IOptionValue;
    /** "Dir. of Travel", from the status section of the supplement page. */
    readonly statusDirectionOfTravel?: string;
    /** "Ethnicity" as repeated on the supplement page, alongside the complaint page's own race/ethnicity boxes. */
    readonly statusEthnicity?: string;
    /** "Jailed", from the status section of the supplement page. */
    readonly statusJailed?: string;
    /** "Main Phone", from the status section of the supplement page. */
    readonly statusMainPhone?: string;
    /** "No LP", whether the vehicle carries no license plate, from the status section of the supplement page. */
    readonly statusNoLicensePlate?: IOptionValue;
    /** "Release Type", from the status section of the supplement page. */
    readonly statusReleaseType?: string;
    /** "Request Warrant", from the status section of the supplement page. */
    readonly statusRequestWarrant?: IOptionValue;
    /** "School Zone", from the status section of the supplement page. */
    readonly statusSchoolZone?: IOptionValue;
    /** "Signed Status", whether the defendant signed the citation, from the supplement page. */
    readonly statusSigned?: IOptionValue;
    /** "Trailer State", from the status section of the supplement page. */
    readonly statusTrailerState?: IOptionValue;
    /** "Trailer Tag", from the status section of the supplement page. */
    readonly statusTrailerTag?: string;
    /** "Transient", from the status section of the supplement page. */
    readonly statusTransient?: IOptionValue;
    /** "Tribe", from the status section of the supplement page. */
    readonly statusTribe?: string;
    /** "Void Reason", from the status section of the supplement page. */
    readonly statusVoidReason?: string;
    /** "Witness/Complainant Captured", from the status section of the supplement page. */
    readonly statusWitnessCaptured?: IOptionValue;
    /** "Date" the complaint was sworn, from the jurat of the complaint page. */
    readonly swornDate?: string;
    /** "Name" the complaint was subscribed and sworn before, from the jurat of the complaint page. */
    readonly swornName?: string;
    /** "Title" of the person the complaint was sworn before, from the jurat of the complaint page. */
    readonly swornTitle?: string;
    /** "COLOR", from the vehicle section of the complaint page. */
    readonly vehicleColor?: string;
    /** "CMV", whether the vehicle is a commercial motor vehicle, from the complaint page. */
    readonly vehicleCommercialVehicle?: IOptionValue;
    /** "HAZ MAT", whether the vehicle was carrying hazardous materials, from the complaint page. */
    readonly vehicleHazardousMaterials?: IOptionValue;
    /** "MAKE", from the vehicle section of the complaint page. */
    readonly vehicleMake?: IOptionValue;
    /** "MODEL", from the vehicle section of the complaint page. */
    readonly vehicleModel?: IOptionValue;
    /** "EXPIRE", the registration expiry, from the vehicle section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly vehicleRegistrationExpires?: string;
    /** "STYLE", from the vehicle section of the complaint page. */
    readonly vehicleStyle?: string;
    /** "TAG", from the vehicle section of the complaint page. */
    readonly vehicleTag?: string;
    /** "STATE" the tag was issued by, from the vehicle section of the complaint page. */
    readonly vehicleTagState?: IOptionValue;
    /** "VIN", from the vehicle section of the complaint page. */
    readonly vehicleVin?: string;
    /** "YR", from the vehicle section of the complaint page. */
    readonly vehicleYear?: number;
    /** "BY ACT OF", from the violation section of the complaint page. */
    readonly violationByActOf?: string;
    /** "County", from the violation section of the complaint page. */
    readonly violationCounty?: IOptionValue;
    /** "On (date)", from the violation section of the complaint page. Held as `YYYY-MM-DD`. */
    readonly violationDate?: string;
    /** "Actual Spd", from the violation information section of the complaint page. */
    readonly violationInformationActualSpeed?: number;
    /** "HFS", whether the offense occurred on a high fatality speed corridor, from the complaint page. */
    readonly violationInformationHighFatalitySpeed?: IOptionValue;
    /** "Incident #", from the violation information section of the complaint page. */
    readonly violationInformationIncidentNumber?: string;
    /** "Lidar Dist", from the violation information section of the complaint page. */
    readonly violationInformationLidarDistance?: string;
    /** "Offense Level", from the violation information section of the complaint page. */
    readonly violationInformationOffenseLevel?: string;
    /** "Spd Det", how the speed was measured, from the violation information section of the complaint page. */
    readonly violationInformationSpeedDetection?: string;
    /** "Limit", the posted speed limit, from the violation information section of the complaint page. */
    readonly violationInformationSpeedLimit?: number;
    /** "Is Block", whether the location is a block address, from the violation section of the complaint page. */
    readonly violationIsBlock?: IOptionValue;
    /** "At or near (Location)", from the violation section of the complaint page. */
    readonly violationLocation?: string;
    /** "MUNI CODE", from the violation section of the complaint page. */
    readonly violationMunicipalCode?: string;
    /** "OFF CODE", from the violation section of the complaint page. */
    readonly violationOffenseCode?: string;
    /** "At (time)", from the violation section of the complaint page. */
    readonly violationTime?: string;
    /** "APPROVED", whether a warrant was recommended, from the warrant section of the warrant page. */
    readonly warrantApproved?: boolean;
    /** "Assistant Municipal Counselor" who approved the warrant, from the warrant section of the warrant page. */
    readonly warrantCounselor?: string;
    /** "Address" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessAddress?: string;
    /** "City" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessCity?: string;
    /** "Email" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessEmail?: string;
    /** "Name" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessName?: string;
    /** "Phone" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessPhone?: string;
    /** "SSN" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessSocialSecurityNumber?: string;
    /** "State" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessState?: IOptionValue;
    /** "Type" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessType?: string;
    /** "Zip" of the witness or complainant, from the witness section of the supplement page. */
    readonly witnessZipCode?: string;
}
