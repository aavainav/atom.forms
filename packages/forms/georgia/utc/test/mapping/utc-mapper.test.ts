import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IGAUTCData, IGAUTCViolationData } from "../../src/mapping/utc-data";
import { GAUTCFormModel } from "../../src/models/utc-form";
import { GAUTCMapper } from "../../src/mapping/utc-mapper";
import { createForm } from "../fixtures/form";

/**
 * A value for every field the contract publishes.
 *
 * Typed as `Required<...>` deliberately: a field added to `IGAUTCData` and forgotten here fails
 * `yarn test-types`, which is what stops the round trip below quietly ceasing to cover the whole contract. This
 * form is the checkbox-heavy one, so that guard matters more here than anywhere else.
 *
 * A citation with every box ticked at once is not one anyone would write, but this is a test of data fidelity
 * rather than of what the form means.
 */
const violation: Required<IGAUTCViolationData> = {
    duiCharged: true,
    duiTestAdministeredBy: "R. Ellis",
    duiTestBlood: true,
    duiTestBreath: true,
    duiTestOther: true,
    duiTestResults: "0.02",
    duiTestUrine: true,
    offenseCodeSection: "40-6-181",
    offenseCompanionCaseNo: true,
    offenseCompanionCaseYes: true,
    offenseCompanionCitation: "ATL-2026-000124",
    offenseDescription: "Speeding 15 over",
    offenseLocalOrdinance: true,
    offenseRemarks: "Clocked in a marked zone",
    offenseStateLaw: true,
    violationCalibrationCheck: "Passed",
    violationClockedByOther: true,
    violationClockedByPatrolVehicle: true,
    violationClockedSpeed: 62,
    violationDriverRequestedAccuracyCheck: true,
    violationLaser: true,
    violationRadar: true,
    violationSerialNumber: "RAD-99812",
    violationSpeedZone: 45,
    violationTwoLaneRoad: true,
    violationVascar: true
};

const data: Required<IGAUTCData> = {
    ...violation,
    additionalViolations: [violation],
    certificationOfficerSignature: "R. Ellis",
    certificationSignatureAndTitle: "R. Ellis, Sergeant",
    certificationSwornDay: "01",
    certificationSwornMonth: "02",
    certificationSwornYear: "2026",
    conditionsCommercialVehicle: true,
    conditionsHazardousMaterial: true,
    conditionsLightingDarkness: true,
    conditionsLightingDaylight: true,
    conditionsLightingOther: true,
    conditionsRoadDry: true,
    conditionsRoadIce: true,
    conditionsRoadOther: true,
    conditionsRoadWet: true,
    conditionsSixteenPlusPassengers: true,
    conditionsSurfaceBlacktop: true,
    conditionsSurfaceConcrete: true,
    conditionsSurfaceDirt: true,
    conditionsSurfaceOther: true,
    conditionsTrafficHeavy: true,
    conditionsTrafficLight: true,
    conditionsTrafficMedium: true,
    conditionsWeatherClear: true,
    conditionsWeatherCloudy: true,
    conditionsWeatherOther: true,
    conditionsWeatherRaining: true,
    courtActionArraignmentPlea: "Not guilty",
    courtActionBailFixed: "500.00",
    courtActionBailGivenBySignature: "M. Whitfield",
    courtActionBailTakenBySignature: "M. Reyes",
    courtActionCashDeposit: "150.00",
    courtActionClerkSignature: "M. Reyes",
    courtActionComplaintFiled: "02/02/2026",
    courtActionDate: "03/10/2026",
    courtActionFineAmount: "249.00",
    courtActionFirstContinuance: "03/24/2026",
    courtActionFirstContinuanceReason: "Counsel unavailable",
    courtActionSecondContinuance: "04/07/2026",
    courtActionSecondContinuanceReason: "Witness unavailable",
    courtActionWaivesTrialByJury: "Yes",
    courtActionWarrantIssued: "03/28/2026",
    courtActionWarrantServed: "04/01/2026",
    dispositionAlcoholDrugAssessment: true,
    dispositionAlcoholDrugRiskReductionSchool: true,
    dispositionBondForfeiture: true,
    dispositionDaysInJail: "0",
    dispositionDeadDocket: true,
    dispositionDefensiveDrivingSchool: true,
    dispositionFineAmount: "249.00",
    dispositionNolleProssed: true,
    dispositionPleadsGuilty: true,
    dispositionPleadsNoloContendere: true,
    dispositionPleadsNotGuilty: true,
    dispositionTrialCourtAdjudicated: true,
    dispositionTrialGuilty: true,
    dispositionTrialJury: true,
    dispositionTrialNotGuilty: true,
    headerAm: true,
    headerCicaNumber: "CICA-4412",
    headerCitationNumber: "ATL-2026-000123",
    headerDay: "31",
    headerHour: "01",
    headerMinute: "42",
    headerMonth: "01",
    headerNcicNumber: "GA0600100",
    headerPm: true,
    headerYear: "2026",
    judgmentAppealBond: "750.00",
    judgmentConfinementTerm: "None",
    judgmentDate: "03/10/2026",
    judgmentFineAmount: "249.00",
    judgmentJudgeSignature: "Hon. P. Alvarez",
    locationCity: "Atlanta",
    locationCounty: { value: "060", description: "Fulton" },
    locationStreet: "Peachtree Street NE",
    officerApdIdNumber: "APD-4412",
    officerAssignment: "Zone 5",
    officerCourtCode: "MC-1",
    officerName: "R. Ellis",
    officerOffDays: "Sat/Sun",
    officerSecondApdIdNumber: "APD-5590",
    officerSecondAssignment: "Zone 5",
    officerSecondCourtCode: "MC-1",
    officerSecondName: "J. Mercer",
    officerSecondOffDays: "Tue/Wed",
    officerSecondTime: "14:00",
    officerTime: "13:42",
    pleaAccusedName: "Dana Whitfield",
    pleaAccusedSignature: "D. Whitfield",
    pleaChargedWith: "Speeding 15 over",
    pleaDay: "10",
    pleaJudgeName: "Hon. P. Alvarez",
    pleaJudgeSignature: "P. Alvarez",
    pleaMaximumFine: "1000.00",
    pleaMaximumMonths: "12",
    pleaMinimumFine: "100.00",
    pleaMinimumMonths: "0",
    pleaMonth: "03",
    pleaYear: "2026",
    statusAccidentNo: true,
    statusAccidentYes: true,
    statusCdlNo: true,
    statusCdlYes: true,
    statusFatalitiesNo: true,
    statusFatalitiesYes: true,
    statusInjuriesNo: true,
    statusInjuriesYes: true,
    summonsAm: true,
    summonsAppearanceDay: "10",
    summonsAppearanceMonth: "03",
    summonsAppearanceYear: "2026",
    summonsCity: "Atlanta",
    summonsCopy: true,
    summonsCourtName: "Municipal Court of Atlanta",
    summonsHour: "08",
    summonsJail: true,
    summonsLicenseDisplayedNo: true,
    summonsLicenseDisplayedYes: true,
    summonsMinute: "30",
    summonsPm: true,
    summonsReleaseTo: "Own recognisance",
    summonsSignature: "D. Whitfield",
    vehicleColor: "Blue",
    vehicleMake: { value: "FORD", description: "Ford" },
    vehicleModel: { value: "F15", description: "F-150" },
    vehicleRegistrationNumber: "GA-4417",
    vehicleRegistrationState: { value: "GA", description: "Georgia" },
    vehicleRegistrationYear: "2026",
    vehicleYear: 2019,
    violatorAddress: "1420 Peachtree Street NE",
    violatorApartment: "4B",
    violatorCity: "Atlanta",
    violatorDateOfBirth: "07/04/1988",
    violatorEye: "BRO",
    violatorFirstName: "Dana",
    violatorHair: "BLK",
    violatorHeight: "5-09",
    violatorLastName: "Whitfield",
    violatorLicenseClass: "C",
    violatorLicenseEndorsements: "None",
    violatorLicenseExpires: "07/04/2028",
    violatorLicenseState: { value: "GA", description: "Georgia" },
    violatorMiddleName: "R",
    violatorOperatorLicenseNumber: "GA1234567",
    violatorPhone: "404-555-0142",
    violatorRace: "W",
    violatorSex: { value: "F", description: "Female" },
    violatorState: { value: "GA", description: "Georgia" },
    violatorSuffix: "Jr",
    violatorWeight: 145,
    violatorZipCode: "30309"
};

describe("GAUTCMapper", () => {
    const mapper = new GAUTCMapper();
    let form: GAUTCFormModel;

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
        /**
         * The clock is pinned, since which of the AM and PM boxes is ticked follows the time of day. The base class
         * stamps the date and time, so a form that stopped inheriting the time would lose them here.
         */
        describe("the date and time of the offense a new form stamps on itself", () => {
            afterEach(() => { vi.useRealTimers(); });

            const stampedAt = async (at: Date) => {
                vi.useFakeTimers({ toFake: ["Date"] });
                vi.setSystemTime(at);

                return mapper.extract(await createForm());
            };

            it("writes the date as the paper prints it: the month's abbreviation, the day and the year's last two digits", async () => {
                expect(await stampedAt(new Date(2026, 5, 15, 15, 30))).toMatchObject({ headerMonth: "Jun", headerDay: "15", headerYear: "26" });
            });

            it("ticks the afternoon box, on the twelve-hour clock, after noon", async () => {
                expect(await stampedAt(new Date(2026, 5, 15, 15, 30))).toMatchObject({ headerHour: "03", headerMinute: "30", headerAm: false, headerPm: true });
            });

            it("ticks the morning box before noon", async () => {
                expect(await stampedAt(new Date(2026, 5, 15, 9, 5))).toMatchObject({ headerHour: "09", headerMinute: "05", headerAm: true, headerPm: false });
            });

            it("reads midnight as twelve in the morning, and noon as twelve in the afternoon", async () => {
                expect(await stampedAt(new Date(2026, 5, 15, 0, 5))).toMatchObject({ headerHour: "12", headerAm: true, headerPm: false });
                expect(await stampedAt(new Date(2026, 5, 15, 12, 0))).toMatchObject({ headerHour: "12", headerAm: false, headerPm: true });
            });
        });

        it("reports an unanswered number as null rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { violatorFirstName: "Dana" } }));

            expect(extracted.vehicleYear).toBeNull();
            expect(extracted.violatorWeight).toBeNull();
            expect(extracted.violationClockedSpeed).toBeNull();
        });

        /** This form answers with rows of checkboxes rather than coded boxes, so every one reports its own state. */
        it("reports an unticked checkbox as false rather than omitting it", async () => {
            const extracted = mapper.extract(await mapper.populate(form, { data: { conditionsWeatherClear: true } }));

            expect(extracted.conditionsWeatherClear).toBe(true);
            expect(extracted.conditionsWeatherRaining).toBe(false);
            expect(extracted.conditionsRoadDry).toBe(false);
        });

        it("reports no additional violations for a single-violation citation", async () => {
            expect("additionalViolations" in mapper.extract(await mapper.populate(form, { data: { offenseCodeSection: "40-6-181" } })))
                .toBe(false);
        });
    });

    describe("populate", () => {
        it("creates a citation page per further violation", async () => {
            const populated = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            expect(populated.getCitationPageCollection().pages).toHaveLength(3);
        });

        it("keeps the first violation in the flat fields and the rest in the array", async () => {
            const extracted = mapper.extract(await mapper.populate(form, {
                data: {
                    offenseCodeSection: "40-6-20",
                    additionalViolations: [violation]
                }
            }));

            expect(extracted.offenseCodeSection).toBe("40-6-20");
            expect(extracted.additionalViolations?.[0].offenseCodeSection).toBe("40-6-181");
        });

        /** A record naming fewer violations than the form holds must not silently discard a page. */
        it("leaves a page beyond the end of the data in place", async () => {
            const threePages = await mapper.populate(form, { data: { additionalViolations: [violation, violation] } });

            const populated = await mapper.populate(threePages, { data: { additionalViolations: [violation] } });

            expect(populated.getCitationPageCollection().pages).toHaveLength(3);
        });

        it("leaves a field the data does not mention at the value it already held", async () => {
            const once = await mapper.populate(form, { data: { violatorFirstName: "Dana" } });
            const twice = await mapper.populate(once, { data: { violatorLastName: "Whitfield" } });

            expect(mapper.extract(twice).violatorFirstName).toBe("Dana");
        });

        it("returns a new form rather than changing the one it was given", async () => {
            const populated = await mapper.populate(form, { data: { violatorFirstName: "Dana" } });

            expect(populated).not.toBe(form);
            expect(mapper.extract(form).violatorFirstName).toBe("");
        });
    });
});
