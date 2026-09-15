import { beforeEach, describe, expect, it } from "vitest";

import type { IOKTrafficData, IOKTrafficViolationData } from "../../src/mapping/traffic-data";
import { OKTrafficFormModel } from "../../src/models/traffic-form";
import { OKTrafficMapper } from "../../src/mapping/traffic-mapper";
import { createForm } from "../fixtures/form";

/**
 * A value for every field the contract publishes.
 *
 * Typed as `Required<...>` deliberately: a field added to `IOKTrafficData` and forgotten here fails
 * `yarn test-types`, which is what stops the round trip below quietly ceasing to cover the whole contract.
 */
const violation: Required<IOKTrafficViolationData> = {
    offenseAmountDue: 249,
    offenseDueDate: "02/28/2026",
    offenseNotes: "Radar verified against tuning fork",
    violationByActOf: "Operating a motor vehicle",
    violationCounty: { value: "55", description: "Oklahoma" },
    violationDate: "01/31/2026",
    violationInformationActualSpeed: 62,
    violationInformationHighFatalitySpeed: { value: "N", description: "No" },
    violationInformationIncidentNumber: "INC-2026-0042",
    violationInformationLidarDistance: "310",
    violationInformationOffenseLevel: "Misdemeanor",
    violationInformationSpeedDetection: "Lidar",
    violationInformationSpeedLimit: 45,
    violationIsBlock: { value: "Y", description: "Yes" },
    violationLocation: "N Robinson Ave at NW 23rd St",
    violationMunicipalCode: "32-91",
    violationOffenseCode: "47-11-801",
    violationTime: "13:42"
};

const data: Required<IOKTrafficData> = {
    ...violation,
    additionalViolations: [violation],
    arraignmentCourtDate: "03/10/2026",
    arraignmentCourtTime: "08:30",
    arraignmentDefendantSignature: "D. Whitfield",
    certificationClerkSignature: "M. Reyes",
    certificationDate: "02/02/2026",
    complaintCitationNumber: "OKC-2026-000123",
    complaintCounselor: "A. Nguyen",
    complaintDate: "02/01/2026",
    defendantAddress: "1420 NW 23rd Street",
    defendantCity: "Oklahoma City",
    defendantFirstName: "Dana",
    defendantLastName: "Whitfield",
    defendantMiddleName: "R",
    defendantState: { value: "OK", description: "Oklahoma" },
    defendantZipCode: "73106",
    descriptionDateOfBirth: "07/04/1988",
    descriptionEthnicity: "Not Hispanic",
    descriptionHeight: "5-09",
    descriptionRace: "W",
    descriptionSex: { value: "F", description: "Female" },
    descriptionWeight: 145,
    headerCitationNumber: "OKC-2026-000123",
    licenseClass: "D",
    licenseEndorsements: "None",
    licenseExpires: "07/04/2028",
    licenseIdentifier: "OK1234567",
    licenseState: { value: "OK", description: "Oklahoma" },
    notesOfficerNotes: "Driver cooperative throughout the stop",
    officerBodyWornCamera: { value: "Y", description: "Yes" },
    officerCommissionNumber: "OKC-4412",
    officerComplainantSignature: "R. Ellis",
    officerName: "R. Ellis",
    officerSecondBodyWornCamera: { value: "N", description: "No" },
    officerSecondCommissionNumber: "OKC-5590",
    officerSecondName: "J. Mercer",
    ownerAddress: "88 Broad Street",
    ownerCity: "Norman",
    ownerName: "Marion Whitfield",
    ownerSameAsSuspect: { value: "N", description: "No" },
    ownerState: { value: "OK", description: "Oklahoma" },
    ownerZipCode: "73069",
    statusAssignment: "Patrol",
    statusConstructionWorkZone: { value: "N", description: "No" },
    statusDirectionOfTravel: "Northbound",
    statusEthnicity: "Not Hispanic",
    statusJailed: "No",
    statusMainPhone: "405-555-0142",
    statusNoLicensePlate: { value: "N", description: "No" },
    statusReleaseType: "Citation released",
    statusRequestWarrant: { value: "N", description: "No" },
    statusSchoolZone: { value: "N", description: "No" },
    statusSigned: { value: "Y", description: "Yes" },
    statusTrailerState: { value: "OK", description: "Oklahoma" },
    statusTrailerTag: "TRL-8891",
    statusTransient: { value: "N", description: "No" },
    statusTribe: "Cherokee Nation",
    statusVoidReason: "Issued in error",
    statusWitnessCaptured: { value: "Y", description: "Yes" },
    swornDate: "02/01/2026",
    swornName: "R. Ellis",
    swornTitle: "Sergeant",
    vehicleColor: "Blue",
    vehicleCommercialVehicle: { value: "N", description: "No" },
    vehicleHazardousMaterials: { value: "N", description: "No" },
    vehicleMake: { value: "FORD", description: "Ford" },
    vehicleModel: { value: "F15", description: "F-150" },
    vehicleRegistrationExpires: "11/30/2026",
    vehicleStyle: "Pickup",
    vehicleTag: "OK-4417",
    vehicleTagState: { value: "OK", description: "Oklahoma" },
    vehicleVin: "1FTFW1E50MFA12345",
    vehicleYear: 2019,
    warrantApproved: true,
    warrantCounselor: "A. Nguyen",
    witnessAddress: "500 Couch Drive",
    witnessCity: "Oklahoma City",
    witnessEmail: "witness@example.com",
    witnessName: "P. Alvarez",
    witnessPhone: "405-555-0177",
    witnessSocialSecurityNumber: "123-45-6789",
    witnessState: { value: "OK", description: "Oklahoma" },
    witnessType: "Civilian",
    witnessZipCode: "73102"
};

describe("OKTrafficMapper", () => {
    const mapper = new OKTrafficMapper();
    let form: OKTrafficFormModel;

    beforeEach(async () => {
        form = await createForm();
    });

    describe("a round trip", () => {
        /**
         * The pair is what a mapper exists for: everything answered on the form has to survive being written out
         * and read back. A field wired into one direction and missed in the other shows up here.
         */
        it("returns every field it was given", async () => {
            expect(mapper.extract(await mapper.populate(form, { data }))).toEqual(data);
        });

        it("survives a second trip unchanged", async () => {
            const once = mapper.extract(await mapper.populate(form, { data }));
            const twice = mapper.extract(await mapper.populate(await createForm(), { data: once }));

            expect(twice).toEqual(once);
        });
    });

    describe("extract", () => {
        it("reports an unanswered number as zero rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { defendantFirstName: "Dana" } }));

            expect(extracted.vehicleYear).toBe(0);
            expect(extracted.descriptionWeight).toBe(0);
            expect(extracted.violationInformationActualSpeed).toBe(0);
        });

        it("reports an unticked checkbox as false rather than omitting it", async () => {
            expect(mapper.extract(await mapper.populate(form, { data: { defendantFirstName: "Dana" } })).warrantApproved)
                .toBe(false);
        });

        it("reports no additional violations for a single-violation citation", async () => {
            expect("additionalViolations" in mapper.extract(await mapper.populate(form, { data: { violationOffenseCode: "47-11-801" } })))
                .toBe(false);
        });
    });

    describe("populate", () => {
        it("creates a complaint page per further violation", async () => {
            const populated = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            expect(populated.getComplaintPageCollection().pages).toHaveLength(3);
        });

        it("keeps the first violation in the flat fields and the rest in the array", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                data: {
                    violationOffenseCode: "47-11-101",
                    additionalViolations: [violation]
                }
            }));

            expect(extracted.violationOffenseCode).toBe("47-11-101");
            expect(extracted.additionalViolations?.[0].violationOffenseCode).toBe("47-11-801");
        });

        /** A record naming fewer violations than the form holds must not silently discard a page. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePages = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            const populated = await mapper.populate(threePages, { data: { additionalViolations: [violation] } });

            expect(populated.getComplaintPageCollection().pages).toHaveLength(3);
        });

        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { data: { defendantFirstName: "Dana" } });
            const twice = await mapper.populate(once, { data: { defendantLastName: "Whitfield" } });

            expect(mapper.extract(twice).defendantFirstName).toBe("Dana");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { defendantFirstName: "Dana" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).defendantFirstName).toBe("");
        });
    });
});
