import { IGAUTCData } from "@forms/ga-utc";

/**
 * Mock records for exercising `GAUTCMapper.populate()` and `extract()` through the report viewer's data reader.
 * Keyed by the `?record=` query param recognized by `ExampleDataModule`.
 *
 * The `full` record populates every one of the sixteen sections, including the court page the clerk and judge
 * complete, so both pages of the citation can be seen filled. It is deliberately a synthetic record rather than a
 * realistic single stop - a speeding citation would not normally also carry a DUI test or a completed disposition -
 * because the point of it is coverage.
 *
 * The `minimal` record covers only what the citation requires before it can be served, and stops at the citation
 * page. It leaves the offense month, day, year, hour, minute and PM boxes alone, so it shows the date and time the
 * form stamps on itself in `initialize()` surviving a partial record, and leaves `vehicleYear` and `violatorWeight`
 * unanswered, so it shows an empty number being omitted from a save rather than reported as 0.
 *
 * Note the dates: `violatorDateOfBirth` and `violatorLicenseExpires` are the citation's only two full date boxes and
 * are written `YYYY-MM-DD`, the one order `DateRangeFieldRule` parses. The date boxes in the header, summons,
 * certification and plea blocks are the separate day / month / year boxes the paper prints, and carry exactly what
 * an officer writes in them - an abbreviated month in the header, a full month name elsewhere, and a two digit year.
 *
 * Option boxes carry the code and description together, matching the registered value lists: `ga-utc:county` and
 * `ga-utc:sex` from the form itself, and the national state, vehicle make and vehicle model lists.
 */
export const mockGAUTCRecords: Record<string, IGAUTCData> = {
    full: {
        headerCicaNumber: "CICA20260907",
        headerNcicNumber: "GAAPD0000",
        headerCitationNumber: "GA0000045912",
        headerMonth: "Sep",
        headerDay: "07",
        headerYear: "26",
        headerHour: "04",
        headerMinute: "44",
        headerPm: true,

        violatorLicenseClass: "C",
        violatorLicenseState: { value: "GA", description: "GEORGIA" },
        violatorLicenseEndorsements: "NONE",
        violatorLicenseExpires: "2029-04-30",
        violatorOperatorLicenseNumber: "058192447",
        violatorLastName: "Whitfield",
        violatorSuffix: "JR",
        violatorFirstName: "James",
        violatorMiddleName: "Robert",
        violatorRace: "W",
        violatorSex: { value: "M", description: "MALE" },
        violatorAddress: "412 Peachtree Street NE",
        violatorApartment: "6C",
        violatorCity: "Atlanta",
        violatorState: { value: "GA", description: "GEORGIA" },
        violatorZipCode: "30308",
        violatorPhone: "404-555-0142",
        violatorDateOfBirth: "1988-03-14",
        violatorHair: "BLACK",
        violatorHeight: "5-11",
        violatorWeight: 185,
        violatorEye: "BROWN",

        vehicleYear: 2021,
        vehicleMake: { value: "TOYT", description: "TOYOTA" },
        vehicleModel: { value: "CAM", description: "CAMRY" },
        vehicleColor: "SILVER",
        vehicleRegistrationNumber: "RTX 4471",
        vehicleRegistrationYear: "26",
        vehicleRegistrationState: { value: "GA", description: "GEORGIA" },

        statusCdlNo: true,
        statusAccidentNo: true,
        statusInjuriesNo: true,
        statusFatalitiesNo: true,

        violationTwoLaneRoad: true,
        violationDriverRequestedAccuracyCheck: true,
        violationRadar: true,
        violationClockedByPatrolVehicle: true,
        violationSerialNumber: "STL-88214",
        violationCalibrationCheck: "2026-09-07 06:00",
        violationClockedSpeed: 58,
        violationSpeedZone: 35,

        duiCharged: true,
        duiTestBreath: true,
        duiTestResults: "0.04",
        duiTestAdministeredBy: "Sgt. M. Alvarez, APD ID 4471",

        offenseDescription: "Speeding in a work zone, 23 mph over the posted limit",
        offenseCodeSection: "40-6-181",
        offenseStateLaw: true,
        offenseCompanionCaseNo: true,
        offenseRemarks: "Driver cooperative; radar reading confirmed at scene at driver's request.",

        conditionsWeatherClear: true,
        conditionsRoadDry: true,
        conditionsSurfaceBlacktop: true,
        conditionsTrafficMedium: true,
        conditionsLightingDaylight: true,

        locationCity: "Atlanta",
        locationCounty: { value: "FULTON", description: "FULTON" },
        locationStreet: "Peachtree Street NE at 10th Street NE",

        officerName: "A. Vainavicz",
        officerApdIdNumber: "0000",
        officerAssignment: "Zone 5",
        officerCourtCode: "MC-2",
        officerOffDays: "SUN/MON",
        officerTime: "1500-2300",
        officerSecondName: "M. Alvarez",
        officerSecondApdIdNumber: "4471",
        officerSecondAssignment: "Zone 5",
        officerSecondCourtCode: "MC-2",
        officerSecondOffDays: "SUN/MON",
        officerSecondTime: "1500-2300",

        summonsAppearanceDay: "14",
        summonsAppearanceMonth: "October",
        summonsAppearanceYear: "26",
        summonsHour: "08",
        summonsMinute: "00",
        summonsAm: true,
        summonsCourtName: "Municipal Court of Atlanta",
        summonsCity: "Atlanta",
        summonsCopy: true,
        summonsLicenseDisplayedYes: true,
        summonsReleaseTo: "Released on citation",
        summonsSignature: "James R. Whitfield Jr.",

        certificationOfficerSignature: "A. Vainavicz",
        certificationSwornDay: "07",
        certificationSwornMonth: "September",
        certificationSwornYear: "26",
        certificationSignatureAndTitle: "L. Brennan, Deputy Clerk",

        courtActionDate: "2026-10-14",
        courtActionComplaintFiled: "2026-10-14",
        courtActionBailFixed: "250.00",
        courtActionCashDeposit: "250.00",
        courtActionBailTakenBySignature: "L. Brennan, Deputy Clerk",
        courtActionBailGivenBySignature: "James R. Whitfield Jr.",
        courtActionFineAmount: "310.00",
        courtActionClerkSignature: "L. Brennan",
        courtActionFirstContinuance: "2026-11-04",
        courtActionFirstContinuanceReason: "Defendant retaining counsel",
        courtActionSecondContinuance: "2026-11-18",
        courtActionSecondContinuanceReason: "Officer unavailable",
        courtActionWarrantIssued: "N/A",
        courtActionWarrantServed: "N/A",
        courtActionWaivesTrialByJury: "Yes - waiver signed 2026-11-18",
        courtActionArraignmentPlea: "Guilty",

        pleaAccusedName: "James Robert Whitfield Jr.",
        pleaChargedWith: "Speeding in a work zone, O.C.G.A. 40-6-181",
        pleaMinimumMonths: "0",
        pleaMinimumFine: "100.00",
        pleaMaximumMonths: "12",
        pleaMaximumFine: "1000.00",
        pleaDay: "18",
        pleaMonth: "November",
        pleaYear: "26",
        pleaAccusedSignature: "James R. Whitfield Jr.",
        pleaJudgeName: "Hon. C. Dinwiddie",
        pleaJudgeSignature: "C. Dinwiddie",

        dispositionPleadsGuilty: true,
        dispositionTrialCourtAdjudicated: true,
        dispositionFineAmount: "310.00",
        dispositionDaysInJail: "0",
        dispositionDefensiveDrivingSchool: true,

        judgmentFineAmount: "310.00",
        judgmentConfinementTerm: "30 days",
        judgmentDate: "2026-11-18",
        judgmentJudgeSignature: "C. Dinwiddie",
        judgmentAppealBond: "500.00"
    },
    minimal: {
        headerCitationNumber: "GA0000045913",

        violatorOperatorLicenseNumber: "220117845",
        violatorLastName: "Okafor",
        violatorFirstName: "Dana",
        violatorSex: { value: "F", description: "FEMALE" },
        violatorDateOfBirth: "1995-11-02",
        violatorAddress: "88 Auburn Avenue NE",
        violatorCity: "Atlanta",
        violatorState: { value: "GA", description: "GEORGIA" },
        violatorZipCode: "30303",

        offenseDescription: "Failure to obey a traffic control device",
        offenseCodeSection: "40-6-20",
        offenseLocalOrdinance: true,

        locationCity: "Atlanta",
        locationCounty: { value: "DEKALB", description: "DEKALB" },
        locationStreet: "Moreland Avenue NE at DeKalb Avenue NE",

        officerName: "A. Vainavicz",
        officerApdIdNumber: "0000",

        summonsAppearanceDay: "21",
        summonsAppearanceMonth: "October",
        summonsAppearanceYear: "26",
        summonsHour: "08",
        summonsMinute: "00",
        summonsAm: true,
        summonsCourtName: "Municipal Court of Atlanta",

        certificationOfficerSignature: "A. Vainavicz"
    }
};
