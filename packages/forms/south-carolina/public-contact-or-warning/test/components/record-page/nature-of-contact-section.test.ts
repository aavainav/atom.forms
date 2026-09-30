import { afterEach, describe, expect, it } from "vitest";

import { NatureOfContactSection } from "../../../src/components/record-page/nature-of-contact-section";
import { NatureOfContactSectionModel } from "../../../src/models/record-page/nature-of-contact-section";
import { click, getFieldIds, getInput, mountRecordSection, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

const withOther = (section: NatureOfContactSectionModel): NatureOfContactSectionModel => section.selectNature(section.other);

describe("NatureOfContactSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.natureOfContactSection, NatureOfContactSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("draws the natures as radios", async () => {
        const { section } = await mountRecordSection(page => page.natureOfContactSection, NatureOfContactSection);

        expect(getInput(section.getSpeeding().id).type).toBe("radio");
        expect(getInput(section.getOther().id).type).toBe("radio");
    });

    it("selects only the nature that is clicked", async () => {
        const { section, applyLastUpdate } = await mountRecordSection(page => page.natureOfContactSection, NatureOfContactSection, withOther);

        click(getInput(section.getSpeeding().id));
        const updated = applyLastUpdate();

        expect(updated.getSpeeding().getValue()).toBe(true);
        expect(updated.getOther().getValue()).toBe(false);
    });

    it("keeps the other box shut until other is chosen", async () => {
        const { section } = await mountRecordSection(page => page.natureOfContactSection, NatureOfContactSection);

        expect(getInput(section.getOtherSpecify().id).disabled).toBe(true);
    });

    it("opens the other box once other is chosen", async () => {
        const { section } = await mountRecordSection(page => page.natureOfContactSection, NatureOfContactSection, withOther);

        expect(getInput(section.getOtherSpecify().id).disabled).toBe(false);
    });
});
