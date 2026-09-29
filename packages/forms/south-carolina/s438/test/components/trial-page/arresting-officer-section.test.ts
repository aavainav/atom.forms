import { afterEach, describe, expect, it } from "vitest";

import TrialArrestingOfficerSection from "../../../src/components/trial-page/arresting-officer-section";
import { getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialArrestingOfficerSection", () => {
    it("draws a box for every field in the section, when the bail was received included", async () => {
        const { definition, section } = await mountTrialSection(page => page.arrestingOfficerSection, TrialArrestingOfficerSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes who received the bail back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.arrestingOfficerSection, TrialArrestingOfficerSection);

        type(getInput(section.getBailReceivedBy().id), "Clerk Adams");

        expect(setValue).toHaveBeenCalledWith(section.bailReceivedBy, "Clerk Adams");
    });
});
