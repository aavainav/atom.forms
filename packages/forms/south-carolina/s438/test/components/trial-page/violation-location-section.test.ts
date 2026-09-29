import { afterEach, describe, expect, it } from "vitest";

import TrialViolationLocationSection from "../../../src/components/trial-page/violation-location-section";
import { getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialViolationLocationSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.violationLocationSection, TrialViolationLocationSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.violationLocationSection, TrialViolationLocationSection);

        type(getInput(section.getCounty().id), "Lexington");

        expect(setValue).toHaveBeenCalledWith(section.county, "Lexington");
    });
});
