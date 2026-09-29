import { afterEach, describe, expect, it } from "vitest";

import TrialViolationSection from "../../../src/components/trial-page/violation-section";
import { click, getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialViolationSection", () => {
    it("draws a box for every field in the section, the court appearance answer included", async () => {
        const { definition, section } = await mountTrialSection(page => page.violationSection, TrialViolationSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violationSection, TrialViolationSection);

        type(getInput(section.getSectionNumber().id), "56-5-1520");

        expect(setValue).toHaveBeenCalledWith(section.sectionNumber, "56-5-1520");
    });

    it("writes the points back as a number", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violationSection, TrialViolationSection);

        type(getInput(section.getScPoints().id), "3");

        expect(setValue).toHaveBeenCalledWith(section.scPoints, 3);
    });

    it("writes the court appearance answer back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violationSection, TrialViolationSection);

        click(getInput(section.getCourtAppearanceRequiredNo().id));

        expect(setValue).toHaveBeenCalledWith(section.courtAppearanceRequiredNo, true);
    });
});
