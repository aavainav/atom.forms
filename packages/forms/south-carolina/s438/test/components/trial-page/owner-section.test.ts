import { afterEach, describe, expect, it } from "vitest";

import TrialOwnerSection from "../../../src/components/trial-page/owner-section";
import { getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialOwnerSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.ownerSection, TrialOwnerSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.ownerSection, TrialOwnerSection);

        type(getInput(section.getLastName().id), "Ortega");

        expect(setValue).toHaveBeenCalledWith(section.lastName, "Ortega");
    });
});
