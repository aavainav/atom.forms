import { afterEach, describe, expect, it } from "vitest";

import { PersonRaceSection } from "../../../src/components/record-page/person-race-section";
import { getControl, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("PersonRaceSection", () => {
    it("draws race and gender as selects, and the birth date as a date box", async () => {
        const { section } = await mountRecordSection(page => page.personSection, PersonRaceSection);

        expect(getControl(section.getRace().id)).toBeInstanceOf(HTMLButtonElement);
        expect(getControl(section.getGender().id)).toBeInstanceOf(HTMLButtonElement);
        expect(getInput(section.getDateOfBirth().id).type).toBe("date");
    });

    it("writes the birth date back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.personSection, PersonRaceSection);

        type(getInput(section.getDateOfBirth().id), "1980-04-12");

        expect(setValue).toHaveBeenCalledWith(section.dateOfBirth, "1980-04-12");
    });
});
