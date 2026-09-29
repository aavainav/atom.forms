import { afterEach, describe, expect, it } from "vitest";

import TrialCourtSection from "../../../src/components/trial-page/court-section";
import { getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialCourtSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.courtSection, TrialCourtSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.courtSection, TrialCourtSection);

        type(getInput(section.getDateOfTrial().id), "03/09/2026");

        expect(setValue).toHaveBeenCalledWith(section.dateOfTrial, "03/09/2026");
    });
});
