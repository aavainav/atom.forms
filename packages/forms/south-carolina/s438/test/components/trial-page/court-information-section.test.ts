import { afterEach, describe, expect, it } from "vitest";

import TrialCourtInformationSection from "../../../src/components/trial-page/court-information-section";
import { click, getFieldIds, getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialCourtInformationSection", () => {
    it("draws a box for every field in the section", async () => {
        const { definition, section } = await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        getFieldIds(section, definition).forEach(id => expect(() => getInput(id)).not.toThrow());
    });

    it("heads the block as the court's information", async () => {
        await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        expect(document.body.textContent).toContain("COURT INFORMATION");
    });

    it("writes a disposition back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        click(getInput(section.getGuilty().id));

        expect(setValue).toHaveBeenCalledWith(section.guilty, true);
    });

    /** Same as Original records the answer only; it does not fill in the charge. */
    it("writes Same as Original back to its own field and nothing else", async () => {
        const { section, setValue } = await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        click(getInput(section.getSameAsOriginal().id));

        expect(setValue).toHaveBeenCalledTimes(1);
        expect(setValue).toHaveBeenCalledWith(section.sameAsOriginal, true);
    });

    it("writes the charge convicted of back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        type(getInput(section.getChargeConvictedOf().id), "Speeding 10 over");

        expect(setValue).toHaveBeenCalledWith(section.chargeConvictedOf, "Speeding 10 over");
    });

    it("writes the conviction's points back as a number", async () => {
        const { section, setValue } = await mountTrialSection(page => page.courtInformationSection, TrialCourtInformationSection);

        type(getInput(section.getScPoints().id), "3");

        expect(setValue).toHaveBeenCalledWith(section.scPoints, 3);
    });
});
