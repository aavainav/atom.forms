import { act, createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import TrialPage from "../../../src/components/trial-page/trial-page";
import { S438FormModel } from "../../../src/models/s438-form";
import { TrialPageModel } from "../../../src/models/trial-page/trial-page";
import { IS438CitationService, S438CitationService } from "../../../src/services";
import { createTrialForm } from "../../fixtures/form";
import { getFieldIds, getInput, mount, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

/** Renders the trial page of a real form, bound through a real form controller. */
async function mountPage() {
    const controllers = new ControllerManager();
    controllers.loadForm(await createTrialForm());

    const controller = controllers.getFormController<S438FormModel>();
    const page = controller.form.getTrialPageCollection().getFirstPage<TrialPageModel>();
    const binding = controller.getPageBinding(controller.form.trialPage, page.id!);
    const services = { get: (service: unknown) => service === IS438CitationService ? new S438CitationService() : undefined } as IServiceCollection;

    mount(createElement(ServicesContext.Provider, { value: services }, createElement(TrialPage, { controllers, binding })));

    return { controller, page };
}

describe("TrialPage", () => {
    it("draws a box for every field on the page", async () => {
        const { page } = await mountPage();
        const sections = [
            page.headerSection, page.violatorSection, page.vehicleSection, page.ownerSection, page.courtSection,
            page.violationSection, page.violationLocationSection, page.arrestingOfficerSection, page.courtInformationSection, page.footerSection
        ];

        sections.forEach(definition => getFieldIds(page.get(definition), definition).forEach(id => expect(() => getInput(id)).not.toThrow()));
    });

    it("writes what is typed onto the trial page", async () => {
        const { controller, page } = await mountPage();

        type(getInput(page.getViolatorSection().getFirstName().id), "Casey");

        expect(controller.form.getTrialPageCollection().getFirstPage<TrialPageModel>().getViolatorSection().getFirstName().getValue()).toBe("Casey");
    });

    it("shares everything but the charge with the trial pages added after it, as the front pages do", async () => {
        const { controller, page } = await mountPage();

        await act(async () => { await controller.addPage(controller.form.trialPage); });
        type(getInput(page.getViolatorSection().getFirstName().id), "Casey");
        type(getInput(page.getViolationSection().getDescription().id), "Speeding");

        const [first, second] = controller.form.getTrialPageCollection().getPages<TrialPageModel>();
        expect(second.getViolatorSection().getFirstName().getValue()).toBe("Casey");
        expect(first.getViolationSection().getDescription().getValue()).toBe("Speeding");
        expect(second.getViolationSection().getDescription().getValue()).toBe("");
    });
});
