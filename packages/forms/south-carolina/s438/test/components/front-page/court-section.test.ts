import { afterEach, describe, expect, it } from "vitest";

import CourtSection from "../../../src/components/front-page/court-section";
import { getFieldIds, getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("CourtSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountFrontSection(page => page.courtSection, CourtSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.courtSection, CourtSection);

        type(getInput(section.getTimeOfTrial().id), "0900");

        expect(setValue).toHaveBeenCalledWith(section.timeOfTrial, "0900");
    });
});
