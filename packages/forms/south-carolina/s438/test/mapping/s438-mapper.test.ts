import { beforeEach, describe, expect, it } from "vitest";

import type { IS438Data, IS438ViolationData } from "../../src/mapping/s438-data";
import { S438Mapper } from "../../src/mapping/s438-mapper";
import { S438FormModel } from "../../src/models/s438-form";
import { createForm } from "../fixtures/form";

/**
 * A value for every field the contract publishes.
 *
 * Typed as `Required<...>` deliberately: a field added to `IS438Data` and forgotten here fails `yarn test-types`,
 * which is what stops the round trip below quietly ceasing to cover the whole contract. That is the same failure
 * the mapper's adjacent read/write pairs exist to make visible, enforced rather than reviewed.
 *
 * A pair of yes/no boxes both set true is not a citation anyone would write, but this is a test of data fidelity
 * rather than of what the form means.
 */
const violation: Required<IS438ViolationData> = {
    violationBloodAlcoholLevel: "0.02",
    violationCourtAppearanceRequiredNo: true,
    violationCourtAppearanceRequiredYes: true,
    violationDateOfViolation: "02/14/2026",
    violationDescription: "Failure to yield",
    violationScPoints: 4,
    violationSectionNumber: "56-5-2930",
    violationSpeed: 45,
    violationSpeedLimit: 35,
    violationTimeOfViolation: "14:05"
};

const data: Required<IS438Data> = {
    additionalViolations: [violation],
    arrestingOfficerBailDeposited: "150.00",
    arrestingOfficerBondAmountRequested: "500.00",
    arrestingOfficerDateOfArrest: "01/31/2026",
    arrestingOfficerName: "R. Ellis",
    arrestingOfficerRank: "Sergeant",
    arrestingOfficerSccjaOfficerNumber: "SC-99812",
    courtCity: "Columbia",
    courtDateOfTrial: "03/02/2026",
    courtName: "Richland County Magistrate",
    courtState: "SC",
    courtStreetAddress: "1701 Main Street",
    courtTimeOfTrial: "09:00",
    courtZipCode: "29201",
    footerTicketNumber: "20260000001234",
    ownerCity: "Charleston",
    ownerFirstName: "Marion",
    ownerLastName: "Whitfield",
    ownerMiddleName: "T",
    ownerState: "SC",
    ownerStreetAddress: "88 Broad Street",
    ownerZipCode: "29401",
    trialArrestingOfficerBailDeposited: "175.00",
    trialArrestingOfficerBailReceivedBy: "Clerk Adams",
    trialArrestingOfficerBondAmountRequested: "525.00",
    trialArrestingOfficerDateBailReceived: "02/02/2026",
    trialArrestingOfficerDateOfArrest: "02/01/2026",
    trialArrestingOfficerName: "T. Ramos",
    trialArrestingOfficerRank: "Corporal",
    trialArrestingOfficerSccjaOfficerNumber: "SC-44120",
    trialCourtCity: "Lexington",
    trialCourtDateOfTrial: "03/09/2026",
    trialCourtInformationAmountCollected: "150.00",
    trialCourtInformationAmountSuspended: "50.00",
    trialCourtInformationArrestResultOfCollision: true,
    trialCourtInformationCaseBeforeCircuitCourt: true,
    trialCourtInformationCaseBeforeFamilyCourt: true,
    trialCourtInformationCaseBeforeFederalCourt: true,
    trialCourtInformationCaseBeforeMagistrate: true,
    trialCourtInformationCaseBeforeMunicipalCourt: true,
    trialCourtInformationCertifiedCorrect: "J. Moore",
    trialCourtInformationCertifiedDate: "03/10/2026",
    trialCourtInformationChargeConvictedOf: "Speeding 10 over",
    trialCourtInformationCommittedTo: "Lexington County Detention",
    trialCourtInformationCourtIfDifferent: "Lexington County Magistrate",
    trialCourtInformationDefendantAppeared: true,
    trialCourtInformationDefendantDidNotAppear: true,
    trialCourtInformationDeterminedBac: true,
    trialCourtInformationDispositionDate: "03/09/2026",
    trialCourtInformationFine: "200.00",
    trialCourtInformationForfeitedBond: true,
    trialCourtInformationGuilty: true,
    trialCourtInformationJail: "5 days",
    trialCourtInformationNolleProssed: true,
    trialCourtInformationNotGuilty: true,
    trialCourtInformationPledNoloContendere: true,
    trialCourtInformationSameAsOriginal: true,
    trialCourtInformationScPoints: 3,
    trialCourtInformationSuspend: "3 days",
    trialCourtInformationTrialByJudge: true,
    trialCourtInformationTrialByJury: true,
    trialCourtInformationVehicleSearched: true,
    trialCourtName: "Lexington County Magistrate",
    trialCourtState: "SC",
    trialCourtStreetAddress: "139 E Main Street",
    trialCourtTimeOfTrial: "10:30",
    trialCourtZipCode: "29072",
    trialFooterTicketNumber: "20260000005678",
    trialHeaderNotes: "Continued once at the defendant's request",
    trialHeaderVoid: true,
    trialOwnerCity: "Greenville",
    trialOwnerFirstName: "Leslie",
    trialOwnerLastName: "Ortega",
    trialOwnerMiddleName: "K",
    trialOwnerState: "SC",
    trialOwnerStreetAddress: "12 Pine Street",
    trialOwnerZipCode: "29601",
    trialVehicleAuto: true,
    trialVehicleBicycle: true,
    trialVehicleCombination: true,
    trialVehicleCommercialVehicle: true,
    trialVehicleHazardousMaterials: true,
    trialVehicleLicenseNumber: "CAR-9921",
    trialVehicleLicenseState: "NC",
    trialVehicleMake: "Toyota",
    trialVehicleMoped: true,
    trialVehicleMotorcycle: true,
    trialVehicleOther: true,
    trialVehiclePedestrian: true,
    trialVehicleYear: 2021,
    trialViolationBloodAlcoholLevel: "0.01",
    trialViolationCourtAppearanceRequiredNo: true,
    trialViolationCourtAppearanceRequiredYes: true,
    trialViolationDateOfViolation: "02/01/2026",
    trialViolationDescription: "Speeding 10 over",
    trialViolationLocation: "US-1 northbound near Gibson Road",
    trialViolationLocationCity: "Lexington",
    trialViolationLocationCounty: "Lexington",
    trialViolationLocationLatitude: "33.9815",
    trialViolationLocationLongitude: "-81.2362",
    trialViolationScPoints: 3,
    trialViolationSectionNumber: "56-5-1520",
    trialViolationSpeed: 65,
    trialViolationSpeedLimit: 55,
    trialViolationTimeOfViolation: "08:15",
    trialViolatorCity: "Lexington",
    trialViolatorCommercialDriverLicenseNo: true,
    trialViolatorCommercialDriverLicenseYes: true,
    trialViolatorDateOfBirth: "11/23/1990",
    trialViolatorDriverLicenseClass: "D",
    trialViolatorDriverLicenseNumber: "SC7654321",
    trialViolatorDriverLicenseState: "SC",
    trialViolatorEyeColor: "BLU",
    trialViolatorFirstName: "Casey",
    trialViolatorHairColor: "BRO",
    trialViolatorHeight: "6-01",
    trialViolatorLastName: "Ortega",
    trialViolatorMiddleName: "J",
    trialViolatorRace: "H",
    trialViolatorSex: "M",
    trialViolatorState: "SC",
    trialViolatorStreetAddress: "300 Park Road",
    trialViolatorWeight: 180,
    trialViolatorZipCode: "29072",
    vehicleAuto: true,
    vehicleBicycle: true,
    vehicleCombination: true,
    vehicleCommercialVehicle: true,
    vehicleHazardousMaterials: true,
    vehicleLicenseNumber: "TRK-4417",
    vehicleLicenseState: "SC",
    vehicleMake: "Ford",
    vehicleMoped: true,
    vehicleMotorcycle: true,
    vehicleOther: true,
    vehiclePedestrian: true,
    vehicleYear: 2019,
    violationBloodAlcoholLevel: "0.00",
    violationCourtAppearanceRequiredNo: true,
    violationCourtAppearanceRequiredYes: true,
    violationDateOfViolation: "01/31/2026",
    violationDescription: "Speeding 15 over",
    violationLocation: "I-26 westbound near mile 108",
    violationLocationCity: "Columbia",
    violationLocationCounty: "Richland",
    violationLocationLatitude: "34.0007",
    violationLocationLongitude: "-81.0348",
    violationScPoints: 2,
    violationSectionNumber: "56-5-1520",
    violationSpeed: 70,
    violationSpeedLimit: 55,
    violationTimeOfViolation: "13:42",
    violatorCity: "Columbia",
    violatorCommercialDriverLicenseNo: true,
    violatorCommercialDriverLicenseYes: true,
    violatorDateOfBirth: "07/04/1988",
    violatorDriverLicenseClass: "D",
    violatorDriverLicenseNumber: "SC1234567",
    violatorDriverLicenseState: "SC",
    violatorEyeColor: "BRO",
    violatorFirstName: "Dana",
    violatorHairColor: "BLK",
    violatorHeight: "5-09",
    violatorLastName: "Whitfield",
    violatorMiddleName: "R",
    violatorRace: "W",
    violatorSex: "F",
    violatorState: "SC",
    violatorStreetAddress: "1420 Gervais Street",
    violatorWeight: 145,
    violatorZipCode: "29201"
};

describe("S438Mapper", () => {
    const mapper = new S438Mapper();
    let form: S438FormModel;

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
        it("includes every field the contract publishes, whether answered or not", () => {
            const extracted = mapper.extract(form);

            expect(Object.keys(extracted).sort()).toEqual(Object.keys(data).filter(key => key !== "additionalViolations").sort());
        });

        it("reports an untouched field at its type's default", () => {
            const extracted = mapper.extract(form);

            expect(extracted.violatorFirstName).toBe("");
            expect(extracted.vehicleYear).toBeNull();
        });

        /** A form the officer has not touched still carries the date and time of violation it stamped on itself. */
        it("stamps the date and time of violation a new form carries on itself", () => {
            const extracted = mapper.extract(form);

            expect(extracted.violationDateOfViolation).toBeTruthy();
            expect(extracted.violationTimeOfViolation).toBeTruthy();
        });

        /** The ticket number is the host's to give, through the defaults for a new form, so a new form has none of its own. */
        it("stamps no ticket number on a new form", () => {
            expect(mapper.extract(form).footerTicketNumber).toBe("");
        });

        /** An unanswered number field holds null, and extract reports that rather than omitting the key. */
        it("reports an unanswered number as null rather than omitting it", async () => {
            const populated = await mapper.populate(form, { data: { violatorFirstName: "Dana" } });

            expect(mapper.extract(populated).vehicleYear).toBeNull();
            expect(mapper.extract(populated).violatorWeight).toBeNull();
        });

        it("reports no additional violations for a single-page citation", () => {
            expect("additionalViolations" in mapper.extract(form)).toBe(false);
        });
    });

    describe("populate", () => {
        it("leaves a field the data does not mention at the value it already held", async () => {
            const stamped = mapper.extract(form).violationDateOfViolation;
            expect(stamped).toBeTruthy();

            const populated = await mapper.populate(form, { data: { violatorFirstName: "Dana" } });

            expect(mapper.extract(populated).violationDateOfViolation).toBe(stamped);
        });

        it("creates a page per further violation", async () => {
            const populated = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            expect(populated.getFrontPageCollection().pages).toHaveLength(3);
        });

        /**
         * The shared sections are written onto every page rather than only the first: a page created here does not
         * go through the form controller, which is what would otherwise have copied them across.
         */
        it("writes the shared sections onto every page it creates", async () => {
            const populated = await mapper.populate(form, {
                data: {
                    violatorFirstName: "Dana",
                    additionalViolations: [violation]
                }
            });

            const names = populated
                .getFrontPageCollection()
                .getPages()
                .map(page => (page as never as { getViolatorSection(): { getFirstName(): { getValue(): string } } })
                    .getViolatorSection().getFirstName().getValue());

            expect(names).toEqual(["Dana", "Dana"]);
        });

        /** The trial copy holds its own fields, so the front page's values are never copied across to it. */
        it("keeps the trial page's fields apart from the front page's", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { violatorFirstName: "Dana" } }));

            expect(extracted.violatorFirstName).toBe("Dana");
            expect(extracted.trialViolatorFirstName).toBe("");
        });

        it("keeps the first violation in the flat fields and the rest in the array", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                data: {
                    violationDescription: "Speeding 15 over",
                    additionalViolations: [violation]
                }
            }));

            expect(extracted.violationDescription).toBe("Speeding 15 over");
            expect(extracted.additionalViolations?.[0].violationDescription).toBe("Failure to yield");
        });

        /** A record naming fewer violations than the form holds must not silently discard a page. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePages = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            const populated = await mapper.populate(threePages, { data: { additionalViolations: [violation] } });

            expect(populated.getFrontPageCollection().pages).toHaveLength(3);
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { violatorFirstName: "Dana" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).violatorFirstName).toBe("");
        });
    });
});
