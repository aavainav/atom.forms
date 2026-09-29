import { afterEach, describe, expect, it } from "vitest";

import TrialVehicleSection from "../../../src/components/trial-page/vehicle-section";
import { click, getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialVehicleSection", () => {
    it("draws a box for every field in the section, the vehicle types included", async () => {
        const { definition, section } = await mountTrialSection(page => page.vehicleSection, TrialVehicleSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes the year back as a number", async () => {
        const { section, setValue } = await mountTrialSection(page => page.vehicleSection, TrialVehicleSection);

        type(getInput(section.getYear().id), "2021");

        expect(setValue).toHaveBeenCalledWith(section.year, 2021);
    });

    it("writes a vehicle type back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.vehicleSection, TrialVehicleSection);

        click(getInput(section.getMotorcycle().id));

        expect(setValue).toHaveBeenCalledWith(section.motorcycle, true);
    });
});
