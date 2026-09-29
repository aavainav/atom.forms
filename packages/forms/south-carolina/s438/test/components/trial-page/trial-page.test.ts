import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import { IServiceCollection } from "@shrub/core";

import TrialPage from "../../../src/components/trial-page/trial-page";
import { FrontPageModel } from "../../../src/models/front-page/front-page";
import { S438FormModel } from "../../../src/models/s438-form";
import { TrialPageModel } from "../../../src/models/trial-page/trial-page";
import { IS438CitationService, S438CitationService } from "../../../src/services";
import { createForm } from "../../fixtures/form";
import { getFieldIds, getInput, mount, type, unmountAll } from "../../fixtures/mount";

afterEach(unmountAll);

/** Renders the trial page of a real form, bound through a real form controller. */
async function mountPage() {
    const controllers = new ControllerManager();
    controllers.loadForm(await createForm());

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

    it("writes what is typed onto the trial page, and leaves the front page alone", async () => {
        const { controller, page } = await mountPage();

        type(getInput(page.getViolatorSection().getFirstName().id), "Casey");

        const form = controller.form;
        expect(form.getTrialPageCollection().getFirstPage<TrialPageModel>().getViolatorSection().getFirstName().getValue()).toBe("Casey");
        expect(form.getFrontPageCollection().getFirstPage<FrontPageModel>().getViolatorSection().getFirstName().getValue()).toBe("");
    });
});
