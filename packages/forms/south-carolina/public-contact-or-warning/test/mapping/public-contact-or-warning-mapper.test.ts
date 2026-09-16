import { beforeEach, describe, expect, it } from "vitest";

import type { IPublicContactOrWarningData } from "../../src/mapping/public-contact-or-warning-data";
import { PublicContactOrWarningFormModel } from "../../src/models/public-contact-or-warning-form";
import { PublicContactOrWarningMapper } from "../../src/mapping/public-contact-or-warning-mapper";
import { RecordPageModel } from "../../src/models/record-page/record-page";
import { createForm } from "../fixtures/form";

/**
 * A value for every field the contract publishes.
 *
 * Typed as `Required<...>` deliberately: a field added to `IPublicContactOrWarningData` and forgotten here fails
 * `yarn test-types`, which is what stops the round trip below quietly ceasing to cover the whole contract.
 *
 * A record with every box ticked at once is not a stop anyone would record, but this is a test of data fidelity
 * rather than of what the form means.
 */
const data: Required<IPublicContactOrWarningData> = {
    agencyCity: "Columbia",
    agencyCounty: { value: "40", description: "Richland" },
    agencyName: "Columbia Police Department",
    natureChangingLanesUnlawfully: true,
    natureContactOnly: true,
    natureDefectiveEquipment: true,
    natureDisregardingStopSign: true,
    natureDisregardingTrafficSignal: true,
    natureDriversLicenseViolation: true,
    natureFailureToDimLights: true,
    natureFollowingTooClose: true,
    natureHandsFreeViolation: true,
    natureImmigrationStop: true,
    natureImproperBacking: true,
    natureImproperLaneUse: true,
    natureImproperLights: true,
    natureImproperPassing: true,
    natureImproperTurn: true,
    natureNoRightOfWay: true,
    natureOther: true,
    natureOtherSpecify: "Obstructed plate",
    naturePedestrian: true,
    natureSeatBeltViolation: true,
    natureSpeeding: true,
    natureVehicleLicenseViolation: true,
    officerIssuedBy: "R. Ellis",
    officerRank: "Sergeant",
    officerScCjaNumber: "SC-99812",
    personDateOfBirth: "07/04/1988",
    personDriverLicenseNumber: "SC1234567",
    personFirstName: "Dana",
    personGender: { value: "F", description: "Female" },
    personLastName: "Whitfield",
    personLatitude: "34.0007",
    personLicensedState: { value: "SC", description: "South Carolina" },
    personLongitude: "-81.0348",
    personMiddleInitial: "R",
    personRace: { value: "W", description: "White" },
    primaryReasonBolo: true,
    primaryReasonMotoristAssistance: true,
    primaryReasonMovingViolation: true,
    primaryReasonNonMovingViolation: true,
    primaryReasonOtherSpecify: "Welfare check",
    primaryReasonSuspiciousActivity: true,
    primaryReasonTrafficCollision: true,
    routeNumberOrName: "I-26",
    routeType: "Interstate",
    searchesBasisOtherSpecify: "Plain view",
    searchesConsentGivenNo: true,
    searchesConsentGivenYes: true,
    searchesConsentGiven: true,
    searchesConsentSearchRequestedNo: true,
    searchesConsentSearchRequestedYes: true,
    searchesConsentSearchRequested: true,
    searchesIncidentToArrest: true,
    searchesInventoryVehicleTowed: true,
    searchesMadeByConsent: true,
    searchesOfDriver: true,
    searchesOfPassenger: true,
    searchesOfPedestrian: true,
    searchesOfVehicle: true,
    searchesProbableCause: true,
    stopCadCallNumber: "CAD-20260131-0042",
    stopCounty: { value: "40", description: "Richland" },
    stopDate: "01/31/2026",
    stopTime: "13:42",
    vehicleCmv: true,
    vehicleLicenseNumber: "TRK-4417",
    vehicleMake: { value: "FORD", description: "Ford" },
    vehicleModel: { value: "F15", description: "F-150" },
    vehicleState: { value: "SC", description: "South Carolina" },
    vehicleYear: 2019
};

describe("PublicContactOrWarningMapper", () => {
    const mapper = new PublicContactOrWarningMapper();
    let form: PublicContactOrWarningFormModel;

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

        it("carries an option field's code and description both ways", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { vehicleMake: { value: "FORD", description: "Ford" } } }));

            expect(extracted.vehicleMake).toEqual({ value: "FORD", description: "Ford" });
        });
    });

    describe("extract", () => {
        it("reports every field of a new form at its default", () => {
            const extracted = mapper.extract(form);

            expect(extracted.agencyName).toBe("");
            expect(extracted.natureSpeeding).toBe(false);
        });

        it("reports an unanswered number as zero rather than omitting it", async () => {
            expect(mapper.extract(await mapper.populate(form, { data: { personFirstName: "Dana" } })).vehicleYear).toBe(0);
        });

        it("reports an unticked checkbox as false rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { natureSpeeding: true } }));

            expect(extracted.natureSpeeding).toBe(true);
            expect(extracted.natureImproperTurn).toBe(false);
        });

        /** An option field is empty only when both halves are blank, so a code with no description still reports. */
        it("reports an option field carrying only a code", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { vehicleState: { value: "SC", description: "" } } }));

            expect(extracted.vehicleState).toEqual({ value: "SC", description: "" });
        });
    });

    describe("populate", () => {
        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { data: { personFirstName: "Dana" } });
            const twice = await mapper.populate(once, { data: { personLastName: "Whitfield" } });

            expect(mapper.extract(twice).personFirstName).toBe("Dana");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { personFirstName: "Dana" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).personFirstName).toBe("");
        });

        /**
         * Only the agency section's fields are wired up to honor `readOnlyFields` today - see
         * `PublicContactOrWarningMapper.populateAgency`.
         */
        describe("readOnlyFields", () => {
            function agencySection(populated: PublicContactOrWarningFormModel) {
                return populated.getRecordPageCollection().getFirstPage<RecordPageModel>().getAgencySection();
            }

            it("disables a field marked true in readOnlyFields", async () => {
                const populated = await mapper.populate(form, { data: { agencyName: "Columbia Police Department" }, readOnlyFields: { agencyName: true } });

                expect(agencySection(populated).getAgencyName().getIsEnabled()).toBe(false);
            });

            it("leaves a defaulted field editable when it is not marked in readOnlyFields", async () => {
                const populated = await mapper.populate(
                    form,
                    { data: { agencyCity: "Columbia", agencyName: "Columbia Police Department" }, readOnlyFields: { agencyName: true } });

                expect(agencySection(populated).getCity().getIsEnabled()).toBe(true);
            });

            it("leaves every field editable when readOnlyFields is omitted", async () => {
                const populated = await mapper.populate(form, { data: { agencyName: "Columbia Police Department" } });

                expect(agencySection(populated).getAgencyName().getIsEnabled()).toBe(true);
            });
        });
    });
});
