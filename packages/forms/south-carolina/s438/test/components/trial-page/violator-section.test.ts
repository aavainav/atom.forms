import { afterEach, describe, expect, it } from "vitest";

import TrialViolatorSection from "../../../src/components/trial-page/violator-section";
import { click, getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialViolatorSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.violatorSection, TrialViolatorSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violatorSection, TrialViolatorSection);

        type(getInput(section.getFirstName().id), "Casey");

        expect(setValue).toHaveBeenCalledWith(section.firstName, "Casey");
    });

    it("writes the weight back as a number", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violatorSection, TrialViolatorSection);

        type(getInput(section.getWeight().id), "180");

        expect(setValue).toHaveBeenCalledWith(section.weight, 180);
    });

    it("writes a CDL answer back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violatorSection, TrialViolatorSection);

        click(getInput(section.getCommercialDriverLicenseYes().id));

        expect(setValue).toHaveBeenCalledWith(section.commercialDriverLicenseYes, true);
    });
});
