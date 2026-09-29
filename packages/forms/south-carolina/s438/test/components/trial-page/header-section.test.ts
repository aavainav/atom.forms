import { afterEach, describe, expect, it } from "vitest";

import TrialHeaderSection from "../../../src/components/trial-page/header-section";
import { click, getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialHeaderSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.headerSection, TrialHeaderSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("prints the ticket's title", async () => {
        await mountTrialSection(page => page.headerSection, TrialHeaderSection);

        expect(document.body.textContent).toContain("UNIFORM TRAFFIC TICKET");
    });

    it("writes the void answer back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.headerSection, TrialHeaderSection);

        click(getInput(section.getVoid().id));

        expect(setValue).toHaveBeenCalledWith(section.void, true);
    });

    it("writes the notes back to their own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.headerSection, TrialHeaderSection);

        type(getInput(section.getNotes().id), "Continued");

        expect(setValue).toHaveBeenCalledWith(section.notes, "Continued");
    });
});
