import { afterEach, describe, expect, it } from "vitest";

import ViolatorSection from "../../../src/components/front-page/violator-section";
import { click, getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("ViolatorSection", () => {
    it("draws a box for every field but race and sex, which are not wired up yet", async () => {
        const { section } = await mountFrontSection(page => page.violatorSection, ViolatorSection);

        [
            section.getFirstName(), section.getMiddleName(), section.getLastName(), section.getStreetAddress(), section.getCity(),
            section.getState(), section.getZipCode(), section.getDriverLicenseState(), section.getDriverLicenseNumber(),
            section.getDriverLicenseClass(), section.getCommercialDriverLicenseYes(), section.getCommercialDriverLicenseNo(),
            section.getDateOfBirth(), section.getHeight(), section.getWeight(), section.getHairColor(), section.getEyeColor()
        ].forEach(field => expect(() => getInput(field.id)).not.toThrow());

        expect(document.getElementById(section.getRace().id!)).toBeNull();
        expect(document.getElementById(section.getSex().id!)).toBeNull();
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violatorSection, ViolatorSection);

        type(getInput(section.getLastName().id), "Whitfield");

        expect(setValue).toHaveBeenCalledWith(section.lastName, "Whitfield");
    });

    it("writes the weight back as a number", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violatorSection, ViolatorSection);

        type(getInput(section.getWeight().id), "185");

        expect(setValue).toHaveBeenCalledWith(section.weight, 185);
    });

    it("writes a CDL answer back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.violatorSection, ViolatorSection);

        click(getInput(section.getCommercialDriverLicenseNo().id));

        expect(setValue).toHaveBeenCalledWith(section.commercialDriverLicenseNo, true);
    });
});
