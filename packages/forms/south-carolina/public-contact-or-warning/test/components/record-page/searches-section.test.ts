import { afterEach, describe, expect, it } from "vitest";

import { SearchesSection } from "../../../src/components/record-page/searches-section";
import { SearchesSectionModel } from "../../../src/models/record-page/searches-section";
import { click, getFieldIds, getInput, mountRecordSection, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

const withConsentRequested = (section: SearchesSectionModel): SearchesSectionModel => section.setConsentSearchRequested(true);
const withBasisOther = (section: SearchesSectionModel): SearchesSectionModel => section.set(section.basisOther, section.getBasisOther().setValue(true));

describe("SearchesSection", () => {
    it("draws a box for every field the section declares", async () => {
        const { definition, section } = await mountRecordSection(page => page.searchesSection, SearchesSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("draws the yes/no answers as radios and the rest as checkboxes", async () => {
        const { section } = await mountRecordSection(page => page.searchesSection, SearchesSection);

        expect(getInput(section.getConsentSearchRequestedYes().id).type).toBe("radio");
        expect(getInput(section.getOfDriver().id).type).toBe("checkbox");
    });

    it("writes a plain checkbox back when it is ticked", async () => {
        const { section, setValue } = await mountRecordSection(page => page.searchesSection, SearchesSection);

        click(getInput(section.getProbableCause().id));

        expect(setValue).toHaveBeenCalledWith(section.probableCause, true);
    });

    it("picks one answer once consent has been requested", async () => {
        const { section, applyLastUpdate } = await mountRecordSection(page => page.searchesSection, SearchesSection, withConsentRequested);

        click(getInput(section.getConsentSearchRequestedYes().id));
        const updated = applyLastUpdate();

        expect(updated.getConsentSearchRequestedYes().getValue()).toBe(true);
        expect(updated.getConsentSearchRequestedNo().getValue()).toBe(false);
    });

    it("keeps the other basis box shut until other is ticked", async () => {
        const { section } = await mountRecordSection(page => page.searchesSection, SearchesSection);

        expect(getInput(section.getBasisOtherSpecify().id).disabled).toBe(true);
    });

    it("opens the other basis box once other is ticked", async () => {
        const { section } = await mountRecordSection(page => page.searchesSection, SearchesSection, withBasisOther);

        expect(getInput(section.getBasisOtherSpecify().id).disabled).toBe(false);
    });
});
