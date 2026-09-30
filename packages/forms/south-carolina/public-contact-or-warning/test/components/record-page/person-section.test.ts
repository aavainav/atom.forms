import { afterEach, describe, expect, it } from "vitest";

import { PersonSection } from "../../../src/components/record-page/person-section";
import { getControl, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("PersonSection", () => {
    it("draws the name, licensed state and license number", async () => {
        const { section } = await mountRecordSection(page => page.personSection, PersonSection);

        [section.getFirstName(), section.getMiddleInitial(), section.getLastName(), section.getLicensedState(), section.getDriverLicenseNumber()]
            .forEach(field => expect(() => getControl(field.id)).not.toThrow());
    });

    it("leaves race, gender, birth date and position to their own sections", async () => {
        const { section } = await mountRecordSection(page => page.personSection, PersonSection);

        [section.getRace(), section.getGender(), section.getDateOfBirth(), section.getLatitude(), section.getLongitude()]
            .forEach(field => expect(document.getElementById(field.id!)).toBeNull());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.personSection, PersonSection);

        type(getInput(section.getLastName().id), "Whitfield");

        expect(setValue).toHaveBeenCalledWith(section.lastName, "Whitfield");
    });
});
