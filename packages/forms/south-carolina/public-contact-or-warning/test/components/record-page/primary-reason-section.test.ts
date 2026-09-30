import { afterEach, describe, expect, it } from "vitest";

import { PrimaryReasonSection } from "../../../src/components/record-page/primary-reason-section";
import { PrimaryReasonSectionModel } from "../../../src/models/record-page/primary-reason-section";
import { click, getFieldIds, getInput, mountRecordSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

const withOther = (section: PrimaryReasonSectionModel): PrimaryReasonSectionModel => section.selectReason(section.other);

describe("PrimaryReasonSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.primaryReasonSection, PrimaryReasonSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("selects only the reason that is clicked", async () => {
        const { section, applyLastUpdate } = await mountRecordSection(page => page.primaryReasonSection, PrimaryReasonSection, withOther);

        click(getInput(section.getBolo().id));
        const updated = applyLastUpdate();

        expect(updated.getBolo().getValue()).toBe(true);
        expect(updated.getOther().getValue()).toBe(false);
    });

    it("keeps the other box shut until other is chosen", async () => {
        const { section } = await mountRecordSection(page => page.primaryReasonSection, PrimaryReasonSection);

        expect(getInput(section.getOtherSpecify().id).disabled).toBe(true);
    });

    it("writes the other box back once other is chosen", async () => {
        const { section, setValue } = await mountRecordSection(page => page.primaryReasonSection, PrimaryReasonSection, withOther);

        type(getInput(section.getOtherSpecify().id), "Welfare check");

        expect(setValue).toHaveBeenCalledWith(section.otherSpecify, "Welfare check");
    });
});
