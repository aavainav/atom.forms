import { afterEach, describe, expect, it } from "vitest";

import { OfficerSection } from "../../../src/components/record-page/officer-section";
import { getFieldIds, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("OfficerSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.officerSection, OfficerSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("writes what is typed back to its own field", async () => {
        const { section, setValue } = await mountRecordSection(page => page.officerSection, OfficerSection);

        type(getInput(section.getRank().id), "Sgt");

        expect(setValue).toHaveBeenCalledWith(section.rank, "Sgt");
    });
});
