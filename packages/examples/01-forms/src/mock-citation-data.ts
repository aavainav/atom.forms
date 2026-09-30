import { IS438Data } from "@forms/s438";

/**
 * Mock records for exercising `S438Mapper.populate()` and `extract()` through the report viewer's data reader.
 * Keyed by the `?citation=` query param `createExampleDataManager` reads.
 *
 * `full` covers every section of the front page, showing the court, violation location and arresting officer
 * populating. `minimal` covers only the violator and the violation, showing a partial record leaving the rest of
 * the form alone, including the date and time of violation the form stamps on itself.
 */
export const mockCitations: Record<string, IS438Data> = {
    full: {
        violatorCity: "Charleston",
        violatorCommercialDriverLicenseNo: true,
        violatorDateOfBirth: "03/14/1988",
        violatorDriverLicenseClass: "D",
        violatorDriverLicenseNumber: "104938271",
        violatorDriverLicenseState: "SC",
        violatorEyeColor: "BRO",
        violatorFirstName: "James",
        violatorHairColor: "BLK",
        violatorHeight: "511",
        violatorLastName: "Whitfield",
        violatorMiddleName: "Robert",
        violatorRace: "W",
        violatorSex: "M",
        violatorState: "SC",
        violatorStreetAddress: "412 Meeting Street",
        violatorWeight: 185,
        violatorZipCode: "29403",

        vehicleAuto: true,
        vehicleLicenseNumber: "SC 4471 KD",
        vehicleLicenseState: "SC",
        vehicleMake: "TOYT",
        vehicleYear: 2021,

        ownerCity: "Charleston",
        ownerFirstName: "James",
        ownerLastName: "Whitfield",
        ownerMiddleName: "Robert",
        ownerState: "SC",
        ownerStreetAddress: "412 Meeting Street",
        ownerZipCode: "29403",

        courtCity: "Charleston",
        courtDateOfTrial: "10/14/2026",
        courtName: "Charleston Municipal Court",
        courtState: "SC",
        courtStreetAddress: "180 Lockwood Boulevard",
        courtTimeOfTrial: "0900",
        courtZipCode: "29403",

        violationCourtAppearanceRequiredNo: true,
        violationDescription: "Speeding, 15 mph over posted limit",
        violationScPoints: 4,
        violationSectionNumber: "56-05-1520",
        violationTimeOfViolation: "1432",

        violationLocation: "Meeting Street at Calhoun Street",
        violationLocationCity: "Charleston",
        violationLocationCounty: "10",
        violationLocationLatitude: "32.78745",
        violationLocationLongitude: "-79.93594",

        arrestingOfficerName: "A Vainavicz",
        arrestingOfficerRank: "SGT",
        arrestingOfficerBailDeposited: "150",
        arrestingOfficerSccjaOfficerNumber: "0000-0000",

        footerTicketNumber: "20260000012345"
    },
    minimal: {
        violatorCity: "Charleston",
        violatorDateOfBirth: "03/15/1989",
        violatorFirstName: "Ana",
        violatorLastName: "Delgado",
        violatorSex: "F",
        violatorState: "SC",
        violatorStreetAddress: "88 King Street",
        violatorZipCode: "29401",

        violationDescription: "Failure to stop at a stop sign",
        violationSectionNumber: "56-05-2110"
    }
};
