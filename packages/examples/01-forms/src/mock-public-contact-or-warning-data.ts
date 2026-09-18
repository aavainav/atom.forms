import { IPublicContactOrWarningData } from "@forms/public-contact-or-warning";

/**
 * Mock records for exercising `PublicContactOrWarningFormModel.populate()` and `extract()` through the report
 * viewer's data reader. Keyed by the `?record=` query param `createExampleDataManager` reads.
 *
 * `full` covers every section, showing the nature-of-contact, primary-reason and searches checkboxes populating.
 * `minimal` covers only what the form requires a value for, showing a partial record leaving the rest alone, and
 * an unanswered `vehicleYear` reporting as zero rather than being omitted.
 *
 * Dates: the form parses `YYYY-MM-DD` only, and a value it can't parse silently skips validation, so a host
 * mapping another order must convert before it gets here.
 */
export const mockPublicContactOrWarningRecords: Record<string, IPublicContactOrWarningData> = {
    full: {
        agencyCity: "Columbia",
        agencyCounty: { value: "40", description: "RICHLAND" },
        agencyName: "South Carolina Police Department",

        personDateOfBirth: "1988-03-14",
        personDriverLicenseNumber: "104938271",
        personFirstName: "James",
        personGender: { value: "M", description: "MALE" },
        personLastName: "Whitfield",
        personLatitude: "34.00071",
        personLicensedState: { value: "SC", description: "SOUTH CAROLINA" },
        personLongitude: "-81.03481",
        personMiddleInitial: "R",
        personRace: { value: "W", description: "WHITE" },

        routeNumberOrName: "Gervais St",
        routeType: "US",

        stopCadCallNumber: "CAD2026091",
        stopCounty: { value: "40", description: "RICHLAND" },
        stopDate: "2026-09-01",
        stopTime: "07:37",

        vehicleCmv: false,
        vehicleLicenseNumber: "SC 4471 KD",
        vehicleMake: { value: "TOYT", description: "TOYOTA" },
        vehicleModel: { value: "CAM", description: "CAMRY" },
        vehicleState: { value: "SC", description: "SOUTH CAROLINA" },
        vehicleYear: 2019,

        officerIssuedBy: "A Vainavicz",
        officerRank: "SGT",
        officerScCjaNumber: "0000",

        natureSpeeding: true,

        primaryReasonMovingViolation: true,

        searchesConsentSearchRequested: true,
        searchesConsentSearchRequestedYes: true,
        searchesConsentGiven: true,
        searchesConsentGivenYes: true,
        searchesMadeByConsent: true,
        searchesOfDriver: true
    },
    minimal: {
        agencyCounty: { value: "10", description: "CHARLESTON" },
        agencyName: "Charleston Police Department",

        personDateOfBirth: "1995-11-02",
        personDriverLicenseNumber: "220117845",
        personFirstName: "Dana",
        personGender: { value: "F", description: "FEMALE" },
        personLastName: "Okafor",
        personLatitude: "32.77657",
        personLicensedState: { value: "SC", description: "SOUTH CAROLINA" },
        personLongitude: "-79.93092",
        personRace: { value: "B", description: "AFRICAN AMERICAN" },

        routeNumberOrName: "King St",
        routeType: "SC",

        stopCounty: { value: "10", description: "CHARLESTON" },
        stopDate: "2026-09-02",
        stopTime: "16:05",

        vehicleLicenseNumber: "SC 8820 TQ",
        vehicleState: { value: "SC", description: "SOUTH CAROLINA" },

        officerIssuedBy: "A Vainavicz",
        officerRank: "SGT",

        natureContactOnly: true,

        primaryReasonMotoristAssistance: true
    }
};
