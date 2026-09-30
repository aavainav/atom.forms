import { afterEach, describe, expect, it } from "vitest";

import ViolationLocationSection from "../../../src/components/front-page/violation-location-section";
import { getFieldIds, getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("ViolationLocationSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountFrontSection(page => page.violationLocationSection, ViolationLocationSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violationLocationSection, ViolationLocationSection);

        type(getInput(section.getLatitude().id), "34.0007");

        expect(setValue).toHaveBeenCalledWith(section.violationLocationLatitude, "34.0007");
    });
});
