import { afterEach, describe, expect, it } from "vitest";

import TrialFooterSection from "../../../src/components/trial-page/footer-section";
import { getInput, mountTrialSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("TrialFooterSection", () => {
    it("says which copy of the ticket this is", async () => {
        await mountTrialSection(page => page.footerSection, TrialFooterSection);

        expect(document.body.textContent).toContain("Electronic Copy - Trial");
        expect(document.body.textContent).toContain("Officer / Driver's Record");
    });

    it("writes the ticket number back to its own field", async () => {
        const { section, setValue } = await mountTrialSection(page => page.footerSection, TrialFooterSection);

        type(getInput(section.getTicketNumber().id), "20260000005678");

        expect(setValue).toHaveBeenCalledWith(section.ticketNumber, "20260000005678");
    });
});
