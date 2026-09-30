import { afterEach, describe, expect, it } from "vitest";

import { StopSection } from "../../../src/components/record-page/stop-section";
import { getControl, getFieldIds, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("StopSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.stopSection, StopSection);

        getFieldIds(section, definition).forEach(id => expect(() => getControl(id)).not.toThrow());
    });

    it("draws the date as a date box", async () => {
        const { section } = await mountRecordSection(page => page.stopSection, StopSection);

        expect(getInput(section.getDate().id).type).toBe("date");
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.stopSection, StopSection);

        type(getInput(section.getCadCallNumber().id), "24-0012");

        expect(setValue).toHaveBeenCalledWith(section.cadCallNumber, "24-0012");
    });
});
