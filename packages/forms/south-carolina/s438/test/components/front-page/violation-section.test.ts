import { afterEach, describe, expect, it } from "vitest";

import ViolationSection from "../../../src/components/front-page/violation-section";
import { getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("ViolationSection", () => {
    it("draws a box for every field but the court appearance answer, which is not wired up yet", async () => {
        const { section } = await mountFrontSection(page => page.violationSection, ViolationSection);

        [
            section.getSectionNumber(), section.getDescription(), section.getDateOfViolation(), section.getTimeOfViolation(),
            section.getSpeed(), section.getSpeedLimit(), section.getScPoints(), section.getBloodAlcoholLevel()
        ].forEach(field => expect(() => getInput(field.id)).not.toThrow());

        expect(document.getElementById(section.getCourtAppearanceRequiredYes().id!)).toBeNull();
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violationSection, ViolationSection);

        type(getInput(section.getBloodAlcoholLevel().id), "0.08");

        expect(setValue).toHaveBeenCalledWith(section.bloodAlcoholLevel, "0.08");
    });

    it("writes the speeds back as numbers", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violationSection, ViolationSection);

        type(getInput(section.getSpeed().id), "70");
        type(getInput(section.getSpeedLimit().id), "55");

        expect(setValue).toHaveBeenCalledWith(section.speed, 70);
        expect(setValue).toHaveBeenCalledWith(section.speedLimit, 55);
    });
});
