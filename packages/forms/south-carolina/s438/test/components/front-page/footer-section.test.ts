import { afterEach, describe, expect, it } from "vitest";

import FooterSection from "../../../src/components/front-page/footer-section";
import { getInput, mountFrontSection, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

describe("FooterSection", () => {
    it("prints the summons notice", async () => {
        await mountFrontSection(page => page.footerSection, FooterSection);

        expect(document.body.textContent).toContain("Present this summons to the trial court shown above");
    });

    it("writes the ticket number back to its own field", async () => {
        const { section, setValue } = await mountFrontSection(page => page.footerSection, FooterSection);

        type(getInput(section.getTicketNumber().id), "20260000012345");

        expect(setValue).toHaveBeenCalledWith(section.ticketNumber, "20260000012345");
    });
});
