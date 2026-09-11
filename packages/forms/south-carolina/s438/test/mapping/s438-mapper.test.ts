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
 * Every value is non-empty, and every checkbox is `true`, because `FormMapper.read` omits a key whose field is
 * empty -- and `false`, `0` and `""` all read as empty. A pair of yes/no boxes both set true is not a citation
 * anyone would write, but this is a test of data fidelity rather than of what the form means.
 */
const violation: Required<IS438ViolationData> = {
    violationBloodAlcoholLevel: "0.02",
    violationCourtAppearanceRequiredNo: true,
    violationCourtAppearanceRequiredYes: true,
    violationDateOfViolation: "02/14/2026",
    violationDescription: "Failure to yield",
    violationScPoints: 4,
    violationSectionNumber: "56-5-2930",
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
            expect(mapper.extract(await mapper.populate(form, data))).toEqual(data);
        });

        it("survives a second trip unchanged", async () => {
            const once = mapper.extract(await mapper.populate(form, data));
            const twice = mapper.extract(await mapper.populate(await createForm(), once));

            expect(twice).toEqual(once);
        });
    });

    describe("extract", () => {
        /**
         * A form the officer has not touched still carries the date of violation and ticket number it stamped on
         * itself, so extract reports those two and nothing else.
         */
        it("reports only the fields a new form stamps on itself", () => {
            const extracted = mapper.extract(form);

            expect(Object.keys(extracted).sort()).toEqual(["footerTicketNumber", "violationDateOfViolation"]);
        });

        it("omits a field the officer left empty", () => {
            const extracted = mapper.extract(form);

            expect("violatorFirstName" in extracted).toBe(false);
            expect("vehicleYear" in extracted).toBe(false);
        });

        /** An unanswered number field holds 0, which would otherwise be reported as a model year of 0. */
        it("omits an unanswered number rather than reporting zero", async () => {
            const populated = await mapper.populate(form, { violatorFirstName: "Dana" });

            expect("vehicleYear" in mapper.extract(populated)).toBe(false);
            expect("violatorWeight" in mapper.extract(populated)).toBe(false);
        });

        it("reports no additional violations for a single-page citation", () => {
            expect("additionalViolations" in mapper.extract(form)).toBe(false);
        });
    });

    describe("populate", () => {
        it("leaves a field the data does not mention at the value it already held", async () => {
            const stamped = mapper.extract(form).footerTicketNumber;

            const populated = await mapper.populate(form, { violatorFirstName: "Dana" });

            expect(mapper.extract(populated).footerTicketNumber).toBe(stamped);
        });

        it("creates a page per further violation", async () => {
            const populated = await mapper.populate(form, { additionalViolations: [violation, violation] });

            expect(populated.getFrontPageCollection().pages).toHaveLength(3);
        });

        /**
         * The shared sections are written onto every page rather than only the first: a page created here does not
         * go through the form controller, which is what would otherwise have copied them across.
         */
        it("writes the shared sections onto every page it creates", async () => {
            const populated = await mapper.populate(form, {
                violatorFirstName: "Dana",
                additionalViolations: [violation]
            });

            const names = populated
                .getFrontPageCollection()
                .getPages()
                .map(page => (page as never as { getViolatorSection(): { getFirstName(): { getValue(): string } } })
                    .getViolatorSection().getFirstName().getValue());

            expect(names).toEqual(["Dana", "Dana"]);
        });

        it("keeps the first violation in the flat fields and the rest in the array", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                violationDescription: "Speeding 15 over",
                additionalViolations: [violation]
            }));

            expect(extracted.violationDescription).toBe("Speeding 15 over");
            expect(extracted.additionalViolations?.[0].violationDescription).toBe("Failure to yield");
        });

        /** A record naming fewer violations than the form holds must not silently discard a page. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePages = await mapper.populate(form, { additionalViolations: [violation, violation] });

            const populated = await mapper.populate(threePages, { additionalViolations: [violation] });

            expect(populated.getFrontPageCollection().pages).toHaveLength(3);
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { violatorFirstName: "Dana" });

            expect(populated).not.toBe(form);
            expect("violatorFirstName" in mapper.extract(form)).toBe(false);
        });
    });
});
