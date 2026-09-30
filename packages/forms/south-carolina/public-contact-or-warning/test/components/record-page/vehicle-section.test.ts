import { afterEach, describe, expect, it } from "vitest";

import { VehicleSection } from "../../../src/components/record-page/vehicle-section";
import { VehicleSectionModel } from "../../../src/models/record-page/vehicle-section";
import { click, getControl, getFieldIds, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

const withMake = (section: VehicleSectionModel): VehicleSectionModel => section.set(section.make, section.getMake().setValue({ value: "TOYT", description: "Toyota" }));

describe("VehicleSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.vehicleSection, VehicleSection);

        getFieldIds(section, definition).forEach(id => expect(() => getControl(id)).not.toThrow());
    });

    it("writes the year back as a number", async () => {
        const { section, setValue } = await mountRecordSection(page => page.vehicleSection, VehicleSection);

        type(getInput(section.getYear().id), "2021");

        expect(setValue).toHaveBeenCalledWith(section.year, 2021);
    });

    it("writes the commercial vehicle box back when it is ticked", async () => {
        const { section, setValue } = await mountRecordSection(page => page.vehicleSection, VehicleSection);

        click(getInput(section.getCmv().id));

        expect(setValue).toHaveBeenCalledWith(section.cmv, true);
    });

    it("keeps the model shut, and says why, until a make is chosen", async () => {
        const { section } = await mountRecordSection(page => page.vehicleSection, VehicleSection);
        const model = getControl(section.getModel().id);

        expect(model.disabled).toBe(true);
        expect(model.textContent).toContain("Select a make first");
    });

    it("opens the model once a make is chosen", async () => {
        const { section } = await mountRecordSection(page => page.vehicleSection, VehicleSection, withMake);

        expect(getControl(section.getModel().id).disabled).toBe(false);
    });
});
