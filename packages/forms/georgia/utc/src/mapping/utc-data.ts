import { IOptionValue } from "@forms/core";

/**
 * The Section II boxes belonging to one charge, differing page to page. The offense is the charge itself; the
 * speed detection and DUI test boxes are its evidence -- the radar reading belongs to the speeding ticket, the
 * breath test to the DUI one, not to every ticket written at the stop.
 */
export interface IGAUTCViolationData {
    /** Section II - the "DUI" box, ticked when the citation charges driving under the influence. */
    readonly duiCharged?: boolean;
    /** Section II - who administered the chemical test. */
    readonly duiTestAdministeredBy?: string;
    /** Section II - the "Blood" test box. */
    readonly duiTestBlood?: boolean;
    /** Section II - the "Breath" test box. */
    readonly duiTestBreath?: boolean;
    /** Section II - the "Other" test box. */
    readonly duiTestOther?: boolean;
    /** Section II - the result of the chemical test. */
    readonly duiTestResults?: string;
    /** Section II - the "Urine" test box. */
    readonly duiTestUrine?: boolean;
    /** Section II - "Code Section" of the offense charged. */
    readonly offenseCodeSection?: string;
    /** Section II - the "No" half of the companion case pair. */
    readonly offenseCompanionCaseNo?: boolean;
    /** Section II - the "Yes" half of the companion case pair. */
    readonly offenseCompanionCaseYes?: boolean;
    /** Section II - "Citation No. / Name" of the companion case. */
    readonly offenseCompanionCitation?: string;
    /** Section II - "Offense (Other than above)". */
    readonly offenseDescription?: string;
    /** Section II - the "Local Ordinance" half of the authority pair. */
    readonly offenseLocalOrdinance?: boolean;
    /** Section II - "Remarks / Victim Name / #". */
    readonly offenseRemarks?: string;
    /** Section II - the "State Law" half of the authority pair. */
    readonly offenseStateLaw?: boolean;
    /** Section II - "Calibration/Check" of the speed detection device. */
    readonly violationCalibrationCheck?: string;
    /** Section II - the "Other" half of the clocked-by pair. */
    readonly violationClockedByOther?: boolean;
    /** Section II - the "Patrol Vehicle" half of the clocked-by pair. */
    readonly violationClockedByPatrolVehicle?: boolean;
    /** Section II - "MPH", the speed the violator was clocked at. */
    readonly violationClockedSpeed?: number | null;
    /** Section II - "Driver Requested Accuracy Check". */
    readonly violationDriverRequestedAccuracyCheck?: boolean;
    /** Section II - the "Laser" speed detection box. */
    readonly violationLaser?: boolean;
    /** Section II - the "Radar" speed detection box. */
    readonly violationRadar?: boolean;
    /** Section II - "Serial #" of the speed detection device. */
    readonly violationSerialNumber?: string;
    /** Section II - "Zone", the posted speed limit. */
    readonly violationSpeedZone?: number | null;
    /** Section II - "2-Lane Road". */
    readonly violationTwoLaneRoad?: boolean;
    /** Section II - the "VASCAR" speed detection box. */
    readonly violationVascar?: boolean;
}

/**
 * The data contract for a Georgia uniform traffic citation, summons, and accusation record.
 *
 * Flat and entirely optional, in the shape a host maps its own record into. Each field is named for the box it
 * fills, prefixed by its section, with the doc comment naming the printed label.
 *
 * An unticked checkbox is **absent**, not `false` -- a record with neither half of a YES/NO pair answered is an
 * unasked question, not a "no". Option boxes carry an `IOptionValue`, the code and description together.
 */
export interface IGAUTCData extends IGAUTCViolationData {
    /**
     * The violations beyond the first, one per further citation page.
     *
     * A citation prints one offense per page, so three charges produce three pages. Violator, vehicle, conditions,
     * location and officer stay flat and identical across all of them; only the Section II boxes (offense, speed
     * detection, DUI test) differ per page. The first violation stays in the flat fields, so a record written
     * before a citation could carry multiple charges round-trips unchanged.
     */
    readonly additionalViolations?: ReadonlyArray<IGAUTCViolationData>;
    /** Section V - the arresting officer's signature on the certification. */
    readonly certificationOfficerSignature?: string;
    /** Section V - "Signature and Title" of the officer the certification was sworn before. */
    readonly certificationSignatureAndTitle?: string;
    /** Section V - the day of "Sworn to and subscribed before me on". */
    readonly certificationSwornDay?: string;
    /** Section V - the month of "Sworn to and subscribed before me on". */
    readonly certificationSwornMonth?: string;
    /** Section V - the last two digits of the year sworn; the paper prints the century beside the box. */
    readonly certificationSwornYear?: string;
    /** Section II conditions bar - "Commercial Vehicle" violation. Independent of the other commercial boxes. */
    readonly conditionsCommercialVehicle?: boolean;
    /** Section II conditions bar - "Hazardous Material" violation. Independent of the other commercial boxes. */
    readonly conditionsHazardousMaterial?: boolean;
    /** Section II conditions bar - lighting "Darkness". One of the lighting column. */
    readonly conditionsLightingDarkness?: boolean;
    /** Section II conditions bar - lighting "Daylight". One of the lighting column. */
    readonly conditionsLightingDaylight?: boolean;
    /** Section II conditions bar - lighting "Other". One of the lighting column. */
    readonly conditionsLightingOther?: boolean;
    /** Section II conditions bar - road "(A)" condition "Dry". One of the road column. */
    readonly conditionsRoadDry?: boolean;
    /** Section II conditions bar - road "(A)" condition "Ice". One of the road column. */
    readonly conditionsRoadIce?: boolean;
    /** Section II conditions bar - road "(A)" condition "Other". One of the road column. */
    readonly conditionsRoadOther?: boolean;
    /** Section II conditions bar - road "(A)" condition "Wet". One of the road column. */
    readonly conditionsRoadWet?: boolean;
    /** Section II conditions bar - "16+ Passengers". Independent of the other commercial boxes. */
    readonly conditionsSixteenPlusPassengers?: boolean;
    /** Section II conditions bar - road "(B)" surface "Blacktop". One of the surface column. */
    readonly conditionsSurfaceBlacktop?: boolean;
    /** Section II conditions bar - road "(B)" surface "Concrete". One of the surface column. */
    readonly conditionsSurfaceConcrete?: boolean;
    /** Section II conditions bar - road "(B)" surface "Dirt". One of the surface column. */
    readonly conditionsSurfaceDirt?: boolean;
    /** Section II conditions bar - road "(B)" surface "Other". One of the surface column. */
    readonly conditionsSurfaceOther?: boolean;
    /** Section II conditions bar - traffic "Heavy". One of the traffic column. */
    readonly conditionsTrafficHeavy?: boolean;
    /** Section II conditions bar - traffic "Light". One of the traffic column. */
    readonly conditionsTrafficLight?: boolean;
    /** Section II conditions bar - traffic "Medium". One of the traffic column. */
    readonly conditionsTrafficMedium?: boolean;
    /** Section II conditions bar - weather "Clear". One of the weather column. */
    readonly conditionsWeatherClear?: boolean;
    /** Section II conditions bar - weather "Cloudy". One of the weather column. */
    readonly conditionsWeatherCloudy?: boolean;
    /** Section II conditions bar - weather "Other". One of the weather column. */
    readonly conditionsWeatherOther?: boolean;
    /** Section II conditions bar - weather "Raining". One of the weather column. */
    readonly conditionsWeatherRaining?: boolean;
    /** Court's copy - "On arraignment, the defendant pleads". */
    readonly courtActionArraignmentPlea?: string;
    /** Court's copy - "Bail fixed at $". */
    readonly courtActionBailFixed?: string;
    /** Court's copy - "Signature of person giving bail". */
    readonly courtActionBailGivenBySignature?: string;
    /** Court's copy - "Signature of person taking bail". */
    readonly courtActionBailTakenBySignature?: string;
    /** Court's copy - "or cash deposit of $". */
    readonly courtActionCashDeposit?: string;
    /** Court's copy - "Signature of Clerk". */
    readonly courtActionClerkSignature?: string;
    /** Court's copy - "Complaint filed". */
    readonly courtActionComplaintFiled?: string;
    /** Court's copy - the "DATE" heading the court action block. */
    readonly courtActionDate?: string;
    /** Court's copy - "Fine in the amount of $ ... received as required by court schedule". */
    readonly courtActionFineAmount?: string;
    /** Court's copy - the first "Continuance to". */
    readonly courtActionFirstContinuance?: string;
    /** Court's copy - the "Reason" for the first continuance. */
    readonly courtActionFirstContinuanceReason?: string;
    /** Court's copy - the second "Continuance to". */
    readonly courtActionSecondContinuance?: string;
    /** Court's copy - the "Reason" for the second continuance. */
    readonly courtActionSecondContinuanceReason?: string;
    /** Court's copy - "Waives Trial by Jury". */
    readonly courtActionWaivesTrialByJury?: string;
    /** Court's copy - the warrant issued line. The paper misspells the label as "Warrent Issued". */
    readonly courtActionWarrantIssued?: string;
    /** Court's copy - the warrant served line. The paper misspells the label as "Warrent Served". */
    readonly courtActionWarrantServed?: string;
    /** Disposition - "Alcohol & Drug Assessment". Independent of the two schools. */
    readonly dispositionAlcoholDrugAssessment?: boolean;
    /** Disposition - "Alcohol & Drug Risk Reduction School". Independent of the other sentencing boxes. */
    readonly dispositionAlcoholDrugRiskReductionSchool?: boolean;
    /** Disposition - other action "(2) Bond Forfeiture". One of the other action group. */
    readonly dispositionBondForfeiture?: boolean;
    /** Disposition - "No. Days (Months) in Jail". */
    readonly dispositionDaysInJail?: string;
    /** Disposition - other action "Dead Docket". One of the other action group. */
    readonly dispositionDeadDocket?: boolean;
    /** Disposition - "Defensive Driving School". Independent of the other sentencing boxes. */
    readonly dispositionDefensiveDrivingSchool?: boolean;
    /** Disposition - "Amount of Fine/Forfeiture $". */
    readonly dispositionFineAmount?: string;
    /** Disposition - other action "Nolle Prossed". One of the other action group. */
    readonly dispositionNolleProssed?: boolean;
    /** Disposition - the defendant pleads "(3) Guilty". One of the plea group. */
    readonly dispositionPleadsGuilty?: boolean;
    /** Disposition - the defendant pleads "Nolo Contendere". One of the plea group. */
    readonly dispositionPleadsNoloContendere?: boolean;
    /** Disposition - the defendant pleads "(3) Not Guilty". One of the plea group. */
    readonly dispositionPleadsNotGuilty?: boolean;
    /** Disposition - trial "Court Adjudicated". One of the trial group. */
    readonly dispositionTrialCourtAdjudicated?: boolean;
    /** Disposition - trial "(1) Guilty". One of the trial group. */
    readonly dispositionTrialGuilty?: boolean;
    /** Disposition - trial "Jury". One of the trial group. */
    readonly dispositionTrialJury?: boolean;
    /** Disposition - trial "Not Guilty". One of the trial group. */
    readonly dispositionTrialNotGuilty?: boolean;
    /** Header - the "AM" half of the offense time. Paired with `headerPm`. */
    readonly headerAm?: boolean;
    /** Header - "CICA Number". */
    readonly headerCicaNumber?: string;
    /** Header - "Citation Number". Assigned by the agency and preprinted on the ticket book, so it arrives with the record. */
    readonly headerCitationNumber?: string;
    /** Header - the "(Day)" of the offense. The form stamps today's day on a new citation, so data carrying one overrides it. */
    readonly headerDay?: string;
    /** Header - the hour of the offense, on the twelve hour clock the AM/PM pair implies. */
    readonly headerHour?: string;
    /** Header - the minute of the offense. */
    readonly headerMinute?: string;
    /** Header - the "On Month" of the offense, as the three letter abbreviation the paper prints. */
    readonly headerMonth?: string;
    /** Header - "NCIC Number". */
    readonly headerNcicNumber?: string;
    /** Header - the "PM" half of the offense time. Paired with `headerAm`. */
    readonly headerPm?: boolean;
    /** Header - the last two digits of the year of the offense. */
    readonly headerYear?: string;
    /** Judgment - "Appeal Bond of $ ... Dollars". */
    readonly judgmentAppealBond?: string;
    /** Judgment - "be confined for a term of ... (days) (months)", the unit circled on paper rather than entered. */
    readonly judgmentConfinementTerm?: string;
    /** Judgment - the "DATE" beside the judge's signature. */
    readonly judgmentDate?: string;
    /** Judgment - "that the defendant pay a fine of $". */
    readonly judgmentFineAmount?: string;
    /** Judgment - "Signature of Judge". */
    readonly judgmentJudgeSignature?: string;
    /** Section III - "In the City of". */
    readonly locationCity?: string;
    /** Section III - "County of"; one of the three counties the citation prints beside the box. */
    readonly locationCounty?: IOptionValue;
    /** Section III - "Street No., Highway, Road, Street, Intersection, or Private Property". */
    readonly locationStreet?: string;
    /** Section III - the issuing officer's "APD ID No.". */
    readonly officerApdIdNumber?: string;
    /** Section III - the issuing officer's "Assignment". */
    readonly officerAssignment?: string;
    /** Section III - the issuing officer's "Court Code". */
    readonly officerCourtCode?: string;
    /** Section III - "Officer Name (Print)". */
    readonly officerName?: string;
    /** Section III - the issuing officer's "Off days". */
    readonly officerOffDays?: string;
    /** Section III - the second officer's "APD ID No.". */
    readonly officerSecondApdIdNumber?: string;
    /** Section III - the second officer's "Assignment". */
    readonly officerSecondAssignment?: string;
    /** Section III - the second officer's "Court Code". */
    readonly officerSecondCourtCode?: string;
    /** Section III - "2d Officer Name (Print)". */
    readonly officerSecondName?: string;
    /** Section III - the second officer's "Off days". */
    readonly officerSecondOffDays?: string;
    /** Section III - the second officer's "Time". */
    readonly officerSecondTime?: string;
    /** Section III - the issuing officer's "Time". */
    readonly officerTime?: string;
    /** Plea and waiver - the accused named in "I, ... have been advised". */
    readonly pleaAccusedName?: string;
    /** Plea and waiver - "Signature of Accused". */
    readonly pleaAccusedSignature?: string;
    /** Plea and waiver - the charge in "that I am being charged with". */
    readonly pleaChargedWith?: string;
    /** Plea and waiver - the day of "This ... day of". */
    readonly pleaDay?: string;
    /** Plea and waiver - the judge named in "I, ... Judge of the MUNICIPAL COURT OF ATLANTA". */
    readonly pleaJudgeName?: string;
    /** Plea and waiver - the judge's signature on the waiver. */
    readonly pleaJudgeSignature?: string;
    /** Plea and waiver - the maximum fine. A blank on paper, so unstated rather than zero when absent. */
    readonly pleaMaximumFine?: string;
    /** Plea and waiver - the maximum months imprisonment. A blank on paper, so unstated rather than zero when absent. */
    readonly pleaMaximumMonths?: string;
    /** Plea and waiver - the minimum fine. A blank on paper, so unstated rather than zero when absent. */
    readonly pleaMinimumFine?: string;
    /** Plea and waiver - the minimum months imprisonment. A blank on paper, so unstated rather than zero when absent. */
    readonly pleaMinimumMonths?: string;
    /** Plea and waiver - the month of "This ... day of". */
    readonly pleaMonth?: string;
    /** Plea and waiver - the "Yr." of "This ... day of". */
    readonly pleaYear?: string;
    /** Section I - the "NO" half of "ACCIDENT". Paired with `statusAccidentYes`. */
    readonly statusAccidentNo?: boolean;
    /** Section I - the "YES" half of "ACCIDENT". Paired with `statusAccidentNo`. */
    readonly statusAccidentYes?: boolean;
    /** Section I - the "NO" half of "CDL". Paired with `statusCdlYes`. */
    readonly statusCdlNo?: boolean;
    /** Section I - the "YES" half of "CDL". Paired with `statusCdlNo`. */
    readonly statusCdlYes?: boolean;
    /** Section I - the "NO" half of "FATALITIES". Paired with `statusFatalitiesYes`. */
    readonly statusFatalitiesNo?: boolean;
    /** Section I - the "YES" half of "FATALITIES". Paired with `statusFatalitiesNo`. */
    readonly statusFatalitiesYes?: boolean;
    /** Section I - the "NO" half of "INJURIES". Paired with `statusInjuriesYes`. */
    readonly statusInjuriesNo?: boolean;
    /** Section I - the "YES" half of "INJURIES". Paired with `statusInjuriesNo`. */
    readonly statusInjuriesYes?: boolean;
    /** Section IV - the "AM" half of the court appearance time. Paired with `summonsPm`. */
    readonly summonsAm?: boolean;
    /** Section IV - the day of "appear in court ... on the ... day". */
    readonly summonsAppearanceDay?: string;
    /** Section IV - the month of "appear in court ... on the ... day of". */
    readonly summonsAppearanceMonth?: string;
    /** Section IV - the "Yr." of the court appearance. */
    readonly summonsAppearanceYear?: string;
    /** Section IV - the city of the court, which the paper prints before ", GEORGIA". */
    readonly summonsCity?: string;
    /** Section IV - the "Copy" half of the copy / jail pair. Paired with `summonsJail`. */
    readonly summonsCopy?: boolean;
    /** Section IV - the court named in "in the". */
    readonly summonsCourtName?: string;
    /** Section IV - the hour of the court appearance. */
    readonly summonsHour?: string;
    /** Section IV - the "Jail" half of the copy / jail pair. Paired with `summonsCopy`. */
    readonly summonsJail?: boolean;
    /** Section IV - the "NO" half of "LICENSE DISPLAYED IN LIEU OF BAIL". Paired with `summonsLicenseDisplayedYes`. */
    readonly summonsLicenseDisplayedNo?: boolean;
    /** Section IV - the "YES" half of "LICENSE DISPLAYED IN LIEU OF BAIL". Paired with `summonsLicenseDisplayedNo`. */
    readonly summonsLicenseDisplayedYes?: boolean;
    /** Section IV - the minute of the court appearance. */
    readonly summonsMinute?: string;
    /** Section IV - the "PM" half of the court appearance time. Paired with `summonsAm`. */
    readonly summonsPm?: boolean;
    /** Section IV - "RELEASE TO". */
    readonly summonsReleaseTo?: string;
    /** Section IV - the violator's signature acknowledging service of the summons. */
    readonly summonsSignature?: string;
    /** Section I - the vehicle's "Color". */
    readonly vehicleColor?: string;
    /** Section I - the vehicle's "Make", as a code from the national make list. */
    readonly vehicleMake?: IOptionValue;
    /** Section I - the vehicle's "Model", as a code from the national model list underneath the chosen make. */
    readonly vehicleModel?: IOptionValue;
    /** Section I - "Registration No.". */
    readonly vehicleRegistrationNumber?: string;
    /** Section I - the registration "State"; the paper preprints GA. */
    readonly vehicleRegistrationState?: IOptionValue;
    /** Section I - the last two digits of the registration "Yr.". */
    readonly vehicleRegistrationYear?: string;
    /** Section I - "Veh. Yr.". An unanswered year is null. */
    readonly vehicleYear?: number | null;
    /** Section I - the violator's "Current Address". */
    readonly violatorAddress?: string;
    /** Section I - the violator's "Apt.". */
    readonly violatorApartment?: string;
    /** Section I - the violator's "City". */
    readonly violatorCity?: string;
    /** Section I - the violator's "DOB", written `YYYY-MM-DD` so the form's date rules can parse it. */
    readonly violatorDateOfBirth?: string;
    /** Section I - the violator's "Eye" colour. Free text; Atlanta publishes no code set for it. */
    readonly violatorEye?: string;
    /** Section I - the violator's "(First)" name; required by the citation. */
    readonly violatorFirstName?: string;
    /** Section I - the violator's "Hair" colour. Free text; Atlanta publishes no code set for it. */
    readonly violatorHair?: string;
    /** Section I - the violator's "Height". */
    readonly violatorHeight?: string;
    /** Section I - the violator's "(Last" name; required by the citation. */
    readonly violatorLastName?: string;
    /** Section I - "License Class or Type". */
    readonly violatorLicenseClass?: string;
    /** Section I - the licence "Endorsements". */
    readonly violatorLicenseEndorsements?: string;
    /** Section I - the licence "Expires" date, written `YYYY-MM-DD`. */
    readonly violatorLicenseExpires?: string;
    /** Section I - the licence "State". */
    readonly violatorLicenseState?: IOptionValue;
    /** Section I - the violator's "(Middle)" name. */
    readonly violatorMiddleName?: string;
    /** Section I - "Operator License No."; required by the citation. */
    readonly violatorOperatorLicenseNumber?: string;
    /** Section I - the violator's "Phone Number". */
    readonly violatorPhone?: string;
    /** Section I - the race half of the printed "(Race/Sex)" box. Free text; Atlanta publishes no code set for it. */
    readonly violatorRace?: string;
    /** Section I - the sex half of the printed "(Race/Sex)" box. */
    readonly violatorSex?: IOptionValue;
    /** Section I - the violator's "State". */
    readonly violatorState?: IOptionValue;
    /** Section I - the violator's "(Suffix)", the second half of the printed last name box. */
    readonly violatorSuffix?: string;
    /** Section I - the violator's "Weight" in lbs. An unanswered weight is null. */
    readonly violatorWeight?: number | null;
    /** Section I - the violator's "Zip Code". */
    readonly violatorZipCode?: string;
}
