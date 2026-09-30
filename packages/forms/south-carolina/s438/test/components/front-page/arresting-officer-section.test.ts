import { afterEach, describe, expect, it } from "vitest";

import ArrestingOfficerSection from "../../../src/components/front-page/arresting-officer-section";
import { getFieldIds, getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("ArrestingOfficerSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountFrontSection(page => page.arrestingOfficerSection, ArrestingOfficerSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.arrestingOfficerSection, ArrestingOfficerSection);

        type(getInput(section.getSccjaOfficerNumber().id), "1234-5678");

        expect(setValue).toHaveBeenCalledWith(section.sccjaOfficerNumber, "1234-5678");
    });
});
