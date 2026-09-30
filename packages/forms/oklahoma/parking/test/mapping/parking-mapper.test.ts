import { beforeEach, describe, expect, it } from "vitest";

import type { IOKParkingData, IOKParkingViolationData } from "../../src/mapping/parking-data";
import { OKParkingFormModel } from "../../src/models/parking-form";
import { OKParkingMapper } from "../../src/mapping/parking-mapper";
import { createForm } from "../fixtures/form";

/**
 * A value for every field the contract publishes.
 *
 * Typed as `Required<...>` deliberately: a field added to `IOKParkingData` and forgotten here fails
 * `yarn test-types`, which is what stops the round trip below quietly ceasing to cover the whole contract.
 */
const violation: Required<IOKParkingViolationData> = {
    paymentAmountDue: 25,
    paymentDueDate: "02/28/2026",
    paymentIncreasedAmountDue: 50,
    paymentIncreasedDueDate: "03/14/2026",
    violationCode: "10-402",
    violationDate: "01/31/2026",
    violationDescription: "Parked in a loading zone",
    violationLocation: "200 block N Robinson Ave",
    violationTime: "09:15"
};

const data: Required<IOKParkingData> = {
    ...violation,
    additionalViolations: [violation],
    certificationClerkSignature: "M. Reyes",
    certificationDate: "02/02/2026",
    complaintCitationNumber: "OKC-2026-000123",
    complaintCounselor: "A. Nguyen",
    complaintDate: "02/01/2026",
    courtDate: "03/10/2026",
    courtTime: "08:30",
    notesOffenseNotes: "Vehicle blocking hydrant access",
    notesOfficerNotes: "Owner not present at time of citation",
    officerCommissionNumber: "OKC-4412",
    officerName: "R. Ellis",
    ownerAddress: "1420 NW 23rd Street",
    ownerCity: "Oklahoma City",
    ownerFirstName: "Dana",
    ownerLastName: "Whitfield",
    ownerMiddleName: "R",
    ownerState: { value: "OK", description: "Oklahoma" },
    ownerSuffix: "Jr",
    ownerZipCode: "73106",
    recordBeat: "12",
    recordCitationNumber: "OKC-2026-000123",
    recordCounty: { value: "55", description: "Oklahoma" },
    recordTribe: "Cherokee Nation",
    recordVoidReason: "Issued in error",
    vehicleColor: "Blue",
    vehicleLicenseNumber: "OK-4417",
    vehicleMake: { value: "FORD", description: "Ford" },
    vehicleMeterNumber: "M-2210",
    vehicleModel: "F-150",
    vehicleNoLicensePlate: true,
    vehicleRegistrationExpires: "11/30/2026",
    vehicleType: "Pickup",
    vehicleVin: "1FTFW1E50MFA12345",
    vehicleYear: 2019,
    warrantApproved: true,
    warrantCounselor: "A. Nguyen"
};

describe("OKParkingMapper", () => {
    const mapper = new OKParkingMapper();
    let form: OKParkingFormModel;

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
        /** The base class stamps both, so a form that stopped inheriting the time would lose it here. */
        it("stamps the date and time of violation a new form carries on itself", () => {
            const extracted = mapper.extract(form);

            expect(extracted.violationDate).toBeTruthy();
            expect(extracted.violationTime).toBeTruthy();
        });

        it("reports an unanswered number as null rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { ownerFirstName: "Dana" } }));

            expect(extracted.vehicleYear).toBeNull();
            expect(extracted.paymentAmountDue).toBeNull();
        });

        it("reports an unticked checkbox as false rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { vehicleNoLicensePlate: true } }));

            expect(extracted.vehicleNoLicensePlate).toBe(true);
            expect(extracted.warrantApproved).toBe(false);
        });

        it("reports no additional violations for a single-violation citation", async () => {
            expect("additionalViolations" in mapper.extract(await mapper.populate(form, { data: { violationCode: "10-402" } })))
                .toBe(false);
        });
    });

    describe("populate", () => {
        it("creates a page per further violation", async () => {
            const populated = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            expect(populated.getCitationPageCollection().pages).toHaveLength(3);
        });

        it("keeps the first violation in the flat fields and the rest in the array", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                data: {
                    violationCode: "10-401",
                    additionalViolations: [violation]
                }
            }));

            expect(extracted.violationCode).toBe("10-401");
            expect(extracted.additionalViolations?.[0].violationCode).toBe("10-402");
        });

        /** A record naming fewer violations than the form holds must not silently discard a page. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePages = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            const populated = await mapper.populate(threePages, { data: { additionalViolations: [violation] } });

            expect(populated.getCitationPageCollection().pages).toHaveLength(3);
        });

        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { data: { ownerFirstName: "Dana" } });
            const twice = await mapper.populate(once, { data: { ownerLastName: "Whitfield" } });

            expect(mapper.extract(twice).ownerFirstName).toBe("Dana");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { ownerFirstName: "Dana" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).ownerFirstName).toBe("");
        });
    });
});
