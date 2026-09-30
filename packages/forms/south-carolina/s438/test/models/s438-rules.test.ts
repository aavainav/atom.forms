import { describe, expect, it } from "vitest";
import { ControllerManager } from "@forms/core";
import { toViolations } from "@forms/violations";

import { violations } from "../../src/generated/violations";
import { IS438Data } from "../../src/mapping/s438-data";
import { S438Mapper } from "../../src/mapping/s438-mapper";
import { datePattern, militaryTimePattern, violationSectionPattern } from "../../src/models/s438-rules";
import { createForm } from "../fixtures/form";

interface IIssue {
    readonly field: string;
    readonly message: string;
}

/** Populates a new citation with the data and validates it, answering each issue by the name of the field it is on. */
async function validate(data: IS438Data = {}): Promise<Array<IIssue>> {
    const controllers = new ControllerManager();
    controllers.loadForm(await new S438Mapper().populate(await createForm(), { data }));

    const rules = controllers.getRulesController();
    rules.validate();

    return rules.getIssueCollection().getIssues().map(issue => ({ field: issue.field.name, message: issue.message }));
}

function messagesOn(issues: Array<IIssue>, field: string): Array<string> {
    return issues.filter(issue => issue.field === field).map(issue => issue.message);
}

describe("the S438 rules", () => {
    describe("formats", () => {
        /** A statute chosen from the list is written into the section number and locked, so one the pattern refused could never be put right. */
        it("accepts every statute in the violation list", () => {
            const refused = toViolations(violations).map(violation => violation.statute ?? violation.code).filter(statute => !violationSectionPattern.test(statute));

            expect(refused).toEqual([]);
        });

        it("accepts an ordinance, and refuses what is neither a statute nor an ordinance", () => {
            expect(violationSectionPattern.test("ORD. 12-34")).toBe(true);
            expect(violationSectionPattern.test("56-5")).toBe(false);
            expect(violationSectionPattern.test("Speeding")).toBe(false);
            expect(violationSectionPattern.test("56-05-15201")).toBe(false);
        });

        it("accepts a date only as mm/dd/yyyy", () => {
            expect(datePattern.test("02/14/2026")).toBe(true);
            expect(datePattern.test("2026-02-14")).toBe(false);
            expect(datePattern.test("13/01/2026")).toBe(false);
        });

        it("accepts a time only in military hhmm", () => {
            expect(militaryTimePattern.test("0815")).toBe(true);
            expect(militaryTimePattern.test("2359")).toBe(true);
            expect(militaryTimePattern.test("8:15 AM")).toBe(false);
            expect(militaryTimePattern.test("2400")).toBe(false);
        });

        /** The form stamps its own time of violation, so a stamp the time rule refused would fail every new citation. */
        it("stamps the time of violation in the format its own rule accepts", async () => {
            expect(messagesOn(await validate(), "violation-time-of-violation")).toEqual([]);
        });
    });

    describe("the violator", () => {
        it("requires the name, on the front page and the trial copy alike", async () => {
            const issues = await validate();

            expect(messagesOn(issues, "violator-first-name")).toContain("Name is required");
            expect(messagesOn(issues, "trial-violator-first-name")).toContain("Name is required");
        });

        it("refuses a PO Box for a street", async () => {
            expect(messagesOn(await validate({ violatorStreetAddress: "PO Box 12" }), "violator-street-address")).toContain("Violator street address must not be a PO Box");
            expect(messagesOn(await validate({ violatorStreetAddress: "12 Pine Street" }), "violator-street-address")).toEqual([]);
        });

        it("allows a zip code of up to 10 characters", async () => {
            expect(messagesOn(await validate({ violatorZipCode: "29201-1234" }), "violator-zip-code")).toEqual([]);
            expect(messagesOn(await validate({ violatorZipCode: "29201-12345" }), "violator-zip-code")).toContain("Zip code cannot be more than 10 characters");
        });

        it("requires the DL state and class only once a license number is entered", async () => {
            expect(messagesOn(await validate(), "violator-driver-license-state")).toEqual([]);

            const issues = await validate({ violatorDriverLicenseNumber: "SC1234567" });
            expect(messagesOn(issues, "violator-driver-license-state")).toContain("DL state is required when a license number is entered");
            expect(messagesOn(issues, "violator-driver-license-class")).toContain("DL class is required when a license number is entered");
        });

        it("requires a CDL answer, and Yes for a class A, B or C license", async () => {
            expect(messagesOn(await validate(), "violator-commercial-driver-license-yes")).toContain("Choose Yes or No for CDL");
            expect(messagesOn(await validate({ violatorDriverLicenseClass: "A", violatorCommercialDriverLicenseNo: true }), "violator-commercial-driver-license-yes"))
                .toContain("CDL should be Yes when the driver license class is A, B or C");
            expect(messagesOn(await validate({ violatorDriverLicenseClass: "D", violatorCommercialDriverLicenseNo: true }), "violator-commercial-driver-license-yes")).toEqual([]);
        });

        it("checks the height's digits and the weight's range", async () => {
            const issues = await validate({ violatorHeight: "6'2", violatorWeight: 1200 });

            expect(messagesOn(issues, "violator-height")).toContain("Height must be 2 or 3 digits, e.g. 74 or 602 for 6'2\"");
            expect(messagesOn(issues, "violator-weight")).toContain("Weight must be between 25 and 999 lbs.");
        });

        /** The front page does not draw race or sex yet, so requiring them there would fail a citation the officer had no way to finish. */
        it("requires race and sex on the trial copy, which draws them, but not on the front page", async () => {
            const issues = await validate();

            expect(messagesOn(issues, "trial-violator-race")).toContain("Race is required");
            expect(messagesOn(issues, "violator-race")).toEqual([]);
        });
    });

    describe("the vehicle and owner", () => {
        it("refuses NONE for a plate number", async () => {
            expect(messagesOn(await validate({ vehicleLicenseNumber: "none" }), "vehicle-license-number")).toContain("Vehicle license number cannot be NONE");
        });

        it("asks for the owner when a vehicle is involved, and not for a pedestrian", async () => {
            expect(messagesOn(await validate(), "trial-owner-first-name")).toContain("Owner first name is required");
            expect(messagesOn(await validate({ trialVehiclePedestrian: true }), "trial-owner-first-name")).toEqual([]);
        });

        it("requires a vehicle type on the trial copy, which draws them, but not on the front page", async () => {
            const issues = await validate();

            expect(issues.some(issue => issue.message === "At least one vehicle type is required" && issue.field.startsWith("trial-"))).toBe(true);
            expect(issues.some(issue => issue.message === "At least one vehicle type is required" && !issue.field.startsWith("trial-"))).toBe(false);
        });
    });

    describe("the court, violation and location", () => {
        it("requires the court's state to be SC", async () => {
            expect(messagesOn(await validate({ courtState: "NC" }), "court-state")).toContain("Court address state code must be SC");
        });

        it("refuses a coordinate outside South Carolina", async () => {
            expect(messagesOn(await validate({ violationLocationLatitude: "40.7128" }), "violation-latitude")).toContain("Latitude must be within South Carolina");
            expect(messagesOn(await validate({ violationLocationLatitude: "34.0007" }), "violation-latitude")).toEqual([]);
        });

        it("checks the B.A. level's format", async () => {
            expect(messagesOn(await validate({ violationBloodAlcoholLevel: "0.1" }), "violation-blood-alcohol-level")).toContain("B.A. level must be formatted x.xx");
        });
    });

    describe("the court's disposition", () => {
        /** The court fills this in, so a citation still in the officer's hands is not held up by it. */
        it("asks which court the case went before only once a disposition date is entered", async () => {
            const field = "trial-court-information-case-before-magistrate";

            expect(messagesOn(await validate(), field)).toEqual([]);
            expect(messagesOn(await validate({ trialCourtInformationDispositionDate: "03/09/2026" }), field)).toContain("Choose the court the case went before");
        });
    });
});
