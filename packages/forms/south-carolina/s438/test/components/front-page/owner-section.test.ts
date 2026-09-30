import { afterEach, describe, expect, it } from "vitest";

import OwnerSection from "../../../src/components/front-page/owner-section";
import { getFieldIds, getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("OwnerSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountFrontSection(page => page.ownerSection, OwnerSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.ownerSection, OwnerSection);

        type(getInput(section.getStreetAddress().id), "88 Broad Street");

        expect(setValue).toHaveBeenCalledWith(section.streetAddress, "88 Broad Street");
    });
});
