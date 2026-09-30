import { afterEach, describe, expect, it } from "vitest";

import { LatitudeLongitudeSection } from "../../../src/components/record-page/latitude-longitude-section";
import { getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("LatitudeLongitudeSection", () => {
    it("draws the latitude and longitude", async () => {
        const { section } = await mountRecordSection(page => page.personSection, LatitudeLongitudeSection);

        [section.getLatitude(), section.getLongitude()].forEach(field => expect(() => getInput(field.id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.personSection, LatitudeLongitudeSection);

        type(getInput(section.getLongitude().id), "-80.9");

        expect(setValue).toHaveBeenCalledWith(section.longitude, "-80.9");
    });
});
