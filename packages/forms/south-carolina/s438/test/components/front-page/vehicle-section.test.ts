import { afterEach, describe, expect, it } from "vitest";

import VehicleSection from "../../../src/components/front-page/vehicle-section";
import { getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("VehicleSection", () => {
    it("draws the plate, state, make and year, but not the vehicle types", async () => {
        const { section } = await mountFrontSection(page => page.vehicleSection, VehicleSection);

        [section.getLicenseNumber(), section.getLicenseState(), section.getMake(), section.getYear()]
            .forEach(field => expect(() => getInput(field.id)).not.toThrow());

        expect(document.getElementById(section.getAuto().id!)).toBeNull();
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.vehicleSection, VehicleSection);

        type(getInput(section.getMake().id), "TOYT");

        expect(setValue).toHaveBeenCalledWith(section.make, "TOYT");
    });

    it("writes the year back as a number", async () => {
        const { section, setValue } = await mountFrontSection(page => page.vehicleSection, VehicleSection);

        type(getInput(section.getYear().id), "2021");

        expect(setValue).toHaveBeenCalledWith(section.year, 2021);
    });
});
