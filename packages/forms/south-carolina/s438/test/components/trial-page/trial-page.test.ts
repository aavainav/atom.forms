import { act, createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

    return { controller, controllers, page };
}

/** Drops a person onto the element the way a browser would, the item carried on a data transfer as a drag source puts it. */
async function dropPerson(element: HTMLElement, firstName: string, lastName: string): Promise<void> {
    const item = { id: "person-1", type: "person", data: { firstName, lastName } };
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: { getData: (type: string) => type === "application/f-importable-person" ? JSON.stringify(item) : "" } });

    await act(async () => { element.dispatchEvent(event); });
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

    describe("dropping a person onto the violator", () => {
        const firstName = (controller: Awaited<ReturnType<typeof mountPage>>["controller"]) => controller.form.getTrialPageCollection().getFirstPage<TrialPageModel>().getViolatorSection().getFirstName().getValue();

        it("fills an empty violator without asking", async () => {
            const { controller, controllers, page } = await mountPage();
            const confirm = vi.fn(async () => true);
            controllers.getDragAndDropController().setConfirmReplace(confirm);

            await dropPerson(getInput(page.getViolatorSection().getFirstName().id), "Dana", "Price");

            expect(confirm).not.toHaveBeenCalled();
            expect(firstName(controller)).toBe("Dana");
        });

        /** What the zone holds is read off the page as it stands, so a name typed after the page was built counts. */
        it("asks before replacing the violator already there, naming both, and keeps them when told not to", async () => {
            const { controller, controllers, page } = await mountPage();
            const confirm = vi.fn(async () => false);
            controllers.getDragAndDropController().setConfirmReplace(confirm);
            const input = getInput(page.getViolatorSection().getFirstName().id);

            type(input, "Casey");
            await dropPerson(input, "Dana", "Price");

            expect(confirm).toHaveBeenCalledWith({ current: "Casey", next: "Dana Price", type: "person" });
            expect(firstName(controller)).toBe("Casey");
        });

        it("replaces the violator once told to", async () => {
            const { controller, controllers, page } = await mountPage();
            controllers.getDragAndDropController().setConfirmReplace(async () => true);
            const input = getInput(page.getViolatorSection().getFirstName().id);

            type(input, "Casey");
            await dropPerson(input, "Dana", "Price");

            expect(firstName(controller)).toBe("Dana");
        });
    });
});
