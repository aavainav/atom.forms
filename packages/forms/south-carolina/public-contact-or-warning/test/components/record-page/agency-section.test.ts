import { afterEach, describe, expect, it } from "vitest";

import { AgencySection } from "../../../src/components/record-page/agency-section";
import { getControl, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("AgencySection", () => {
    it("draws the agency name, city and county", async () => {
        const { section } = await mountRecordSection(page => page.agencySection, AgencySection);

        [section.getAgencyName(), section.getCity(), section.getCounty()]
            .forEach(field => expect(() => getControl(field.id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.agencySection, AgencySection);

        type(getInput(section.getCity().id), "Columbia");

        expect(setValue).toHaveBeenCalledWith(section.city, "Columbia");
    });

    it("draws its boxes without borders", async () => {
        const { section } = await mountRecordSection(page => page.agencySection, AgencySection);

        [section.getAgencyName(), section.getCity(), section.getCounty()]
            .forEach(field => expect(getControl(field.id).closest(".f-field-control")!.classList).toContain("border-0"));
    });
});
