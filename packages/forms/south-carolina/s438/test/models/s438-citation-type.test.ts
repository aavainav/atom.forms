import { describe, expect, it } from "vitest";

import { FrontPageModel } from "../../src/models/front-page/front-page";
import { TrialPageModel } from "../../src/models/trial-page/trial-page";
import { createForm, createTrialForm } from "../fixtures/form";

/** Today, as the citation's date boxes carry it. */
function today(): string {
    const date = new Date();

    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

describe("the S438 citation type", () => {
    it("offers Court and Trial as its blank forms, with Court the default", async () => {
        const form = await createForm();

        expect(form.variants.map(variant => variant.id)).toEqual(["court", "trial"]);
        expect(form.getDefaultVariant()?.id).toBe("court");
    });

    it("says which variant it is in, as the citation type", async () => {
        expect((await createForm()).getVariant()).toBe("court");
        expect((await createTrialForm()).getVariant()).toBe("trial");
    });

    it("starts as a court citation: a front page, no trial page, and the notice page", async () => {
        const form = await createForm();

        expect(form.getCitationType()).toBe("court");
        expect(form.getFrontPageCollection().pages).toHaveLength(1);
        expect(form.getTrialPageCollection().pages).toHaveLength(0);
        expect(form.getNoticePageCollection().pages).toHaveLength(1);
    });

    it("lists its pages front, trial and then notice, so the copy it is on always comes before the notice page", async () => {
        const court = await createForm();
        const trial = await createTrialForm();

        expect(court.getPages().map(page => page.name)).toEqual(["front-page", "notice-page"]);
        expect(trial.getPages().map(page => page.name)).toEqual(["trial-page", "notice-page"]);
    });

    it("becomes a trial citation with its front pages dropped, one trial page, and today's date stamped on it", async () => {
        const form = await createTrialForm();
        const violation = form.getTrialPageCollection().getFirstPage<TrialPageModel>().getViolationSection();

        expect(form.getCitationType()).toBe("trial");
        expect(form.getFrontPageCollection().pages).toHaveLength(0);
        expect(form.getTrialPageCollection().pages).toHaveLength(1);
        expect(violation.getDateOfViolation().getValue()).toBe(today());
        expect(violation.getDateOfViolation().getIsEnabled()).toBe(false);
        expect(violation.getTimeOfViolation().getValue()).not.toBe("");
    });

    it("drops every front page, however many it had, and can go back to court", async () => {
        const form = await createForm();
        const two = form.addPage(await form.frontPage.createPage(form).initialize(), form.frontPage);

        const court = await (await two.setCitationType("trial")).setCitationType("court");

        expect(court.getFrontPageCollection().pages).toHaveLength(1);
        expect(court.getTrialPageCollection().pages).toHaveLength(0);
        expect(court.getFrontPageCollection().getFirstPage<FrontPageModel>().getViolationSection().getDateOfViolation().getValue()).toBe(today());
    });

    it("keeps the pages it has when set to the copy it is already on", async () => {
        const form = await createForm();
        const two = form.addPage(await form.frontPage.createPage(form).initialize(), form.frontPage);

        expect((await two.setCitationType("court")).getFrontPageCollection().pages).toHaveLength(2);
    });

    it("applies its variants by id, and refuses one it does not declare", async () => {
        const form = await createForm();

        expect((await form.applyVariant("trial")).getCitationType()).toBe("trial");
        await expect(form.applyVariant("warning")).rejects.toThrow("has no variant called \"warning\"");
    });
});
