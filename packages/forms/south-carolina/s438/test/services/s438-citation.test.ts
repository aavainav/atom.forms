import { beforeEach, describe, expect, it } from "vitest";
import { ControllerManager, FormModel, PageCollection } from "@forms/core";
import { IViolation } from "@forms/violations";

import { createForm, createTrialForm } from "../fixtures/form";

import { FrontPageModel } from "../../src/models/front-page/front-page";
import { TrialPageModel } from "../../src/models/trial-page/trial-page";
import { TrialPageOwnerDropzone } from "../../src/models/trial-page/dropzones/trial-page-owner-dropzone";
import { TrialPageVehicleDropzone } from "../../src/models/trial-page/dropzones/trial-page-vehicle-dropzone";
import { TrialPageViolationDropzone } from "../../src/models/trial-page/dropzones/trial-page-violation-dropzone";
import { TrialPageViolatorDropzone } from "../../src/models/trial-page/dropzones/trial-page-violator-dropzone";

import { S438CitationService } from "../../src/services/s438-citation";
import { S438FormModel } from "../../src/models/s438-form";
import { S438FormSchema } from "../../src/models/s438-form-schema";

const schema = FormModel.getSchema<S438FormSchema>(S438FormModel);

describe("S438CitationService", () => {
    const service = new S438CitationService();
    let controllers: ControllerManager;

    beforeEach(async () => {
        controllers = new ControllerManager();
        controllers.loadForm(await createForm());
    });

    function getFrontPage(): FrontPageModel {
        return controllers.getFormController().form.get<PageCollection>(schema.frontPage).pages[0] as FrontPageModel;
    }

    describe("applyViolations", () => {
        /**
         * Both methods resolve the schema through `FormModel.getSchema`, which is keyed by the form model's own
         * constructor rather than the schema's -- passing the wrong one throws "Definition for entity type ... is
         * not registered" the instant either method runs. That is exactly the regression this guards: every
         * assertion below is unreachable if the wrong constructor is wired through from `module.ts`.
         */
        it("resolves the schema and writes the chosen violation onto the form's first page", async () => {
            const violation: IViolation = { id: "dui", code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", points: 4 };

            await service.applyViolations(controllers, [violation], S438FormModel);

            const section = getFrontPage().getViolationSection();
            expect(section.getSectionNumber().getValue()).toBe("56-5-2930");
            expect(section.getDescription().getValue()).toBe("Failure to yield");
            expect(section.getScPoints().getValue()).toBe(4);
        });

        it("does nothing when there are no violations to apply", async () => {
            await expect(service.applyViolations(controllers, [], S438FormModel)).resolves.toBeUndefined();
        });

        it("adds a page for each violation beyond the first, writing each onto its own page", async () => {
            const first: IViolation = { id: "dui", code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", points: 4 };
            const second: IViolation = { id: "blue-light", code: "56-5-750", description: "Failure to stop for a blue light", statute: "56-5-750", points: 6 };
            const third: IViolation = { id: "speeding", code: "56-5-1520", description: "Speeding", statute: "56-5-1520", points: 2 };

            await service.applyViolations(controllers, [first, second, third], S438FormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.frontPage).getPages<FrontPageModel>();

            expect(pages).toHaveLength(3);
            expect(pages[0].getViolationSection().getSectionNumber().getValue()).toBe("56-5-2930");
            expect(pages[1].getViolationSection().getSectionNumber().getValue()).toBe("56-5-750");
            expect(pages[2].getViolationSection().getSectionNumber().getValue()).toBe("56-5-1520");
        });

        it("adds to the citation on a later call rather than overwriting the violation already on it", async () => {
            const first: IViolation = { id: "dui", code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930" };
            const second: IViolation = { id: "blue-light", code: "56-5-750", description: "Failure to stop for a blue light", statute: "56-5-750" };

            await service.applyViolations(controllers, [first], S438FormModel);
            await service.applyViolations(controllers, [second], S438FormModel);

            const pages = controllers.getFormController().form.get<PageCollection>(schema.frontPage).getPages<FrontPageModel>();

            expect(pages).toHaveLength(2);
            expect(pages[0].getViolationSection().getSectionNumber().getValue()).toBe("56-5-2930");
            expect(pages[1].getViolationSection().getSectionNumber().getValue()).toBe("56-5-750");
        });
    });

    describe("getAppliedViolations", () => {
        it("resolves the schema without throwing", () => {
            expect(() => service.getAppliedViolations(controllers, [], S438FormModel)).not.toThrow();
        });

        it("narrows to the violations already carried on the form", async () => {
            const applied: IViolation = { id: "dui", code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930" };
            const notApplied: IViolation = { id: "blue-light", code: "56-5-750", description: "Failure to stop for a blue light", statute: "56-5-750" };

            await service.applyViolations(controllers, [applied], S438FormModel);

            expect(service.getAppliedViolations(controllers, [applied, notApplied], S438FormModel)).toEqual([applied]);
        });

        /**
         * Some statutes repeat across offense-count variants that print the same code but a different description
         * (1st/2nd/3rd offense). The statute alone can't tell them apart once one is on the form; the description,
         * which is written right alongside it, is what does.
         */
        it("does not treat a different violation sharing the same statute as already applied", async () => {
            const firstOffense: IViolation = { id: "first-offense", code: "02-17-0030", description: "Failure to file; 1st offense", statute: "02-17-0030" };
            const secondOffense: IViolation = { id: "second-offense", code: "02-17-0030", description: "Failure to file; 2nd offense", statute: "02-17-0030" };

            await service.applyViolations(controllers, [firstOffense], S438FormModel);

            expect(service.getAppliedViolations(controllers, [firstOffense, secondOffense], S438FormModel)).toEqual([firstOffense]);
        });
    });

    describe("applyViolations on a trial citation", () => {
        const first: IViolation = { id: "dui", code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", points: 4 };
        const second: IViolation = { id: "blue-light", code: "56-5-750", description: "Failure to stop for a blue light", statute: "56-5-750", points: 6 };

        beforeEach(async () => {
            controllers.loadForm(await createTrialForm());
        });

        function getTrialPages(): Array<TrialPageModel> {
            return controllers.getFormController<S438FormModel>().form.getTrialPageCollection().getPages<TrialPageModel>();
        }

        it("writes each violation onto a trial page of its own, locked as the front page's are, and adds no front page", async () => {
            await service.applyViolations(controllers, [first, second], S438FormModel);

            const pages = getTrialPages();
            expect(pages.map(page => page.getViolationSection().getDescription().getValue())).toEqual(["Failure to yield", "Failure to stop for a blue light"]);
            expect(pages[0].getViolationSection().getSectionNumber().getIsEnabled()).toBe(false);
            expect(controllers.getFormController<S438FormModel>().form.getFrontPageCollection().pages).toHaveLength(0);
        });

        it("carries the first page's date of violation onto the pages it adds", async () => {
            await service.applyViolations(controllers, [first, second], S438FormModel);

            const [page, added] = getTrialPages();
            expect(added.getViolationSection().getDateOfViolation().getValue()).toBe(page.getViolationSection().getDateOfViolation().getValue());
            expect(added.getViolationSection().getDateOfViolation().getValue()).not.toBe("");
        });

        it("names the violations its trial pages carry", async () => {
            await service.applyViolations(controllers, [first], S438FormModel);

            expect(service.getAppliedViolations(controllers, [first, second], S438FormModel)).toEqual([first]);
        });
    });

    describe("the trial page's dropzones", () => {
        const person = { firstName: "James", middleName: "Robert", lastName: "Whitfield", address: "412 Meeting Street", city: "Charleston", state: "SC", zipCode: "29403" };

        beforeEach(async () => {
            controllers.loadForm(await createTrialForm());
        });

        function getTrialPage(): TrialPageModel {
            return controllers.getFormController<S438FormModel>().form.getTrialPageCollection().getFirstPage<TrialPageModel>();
        }

        it("writes a dropped person onto the trial page's violator section", () => {
            const page = getTrialPage();
            const section = service.applyTrialViolatorDropzone(page, page.getDropzone(TrialPageViolatorDropzone).onDrop(person)).getViolatorSection();

            expect(section.getFirstName().getValue()).toBe("James");
            expect(section.getLastName().getValue()).toBe("Whitfield");
            expect(section.getZipCode().getValue()).toBe("29403");
        });

        it("writes a dropped person onto the trial page's owner section", () => {
            const page = getTrialPage();
            const section = service.applyTrialOwnerDropzone(page, page.getDropzone(TrialPageOwnerDropzone).onDrop(person)).getOwnerSection();

            expect(section.getFirstName().getValue()).toBe("James");
            expect(section.getStreetAddress().getValue()).toBe("412 Meeting Street");
        });

        it("writes a dropped vehicle onto the trial page's vehicle section", () => {
            const page = getTrialPage();
            const section = service.applyTrialVehicleDropzone(page, page.getDropzone(TrialPageVehicleDropzone).onDrop({ make: "Toyota", model: "Camry", year: 2021 })).getVehicleSection();

            expect(section.getMake().getValue()).toBe("Toyota");
            expect(section.getYear().getValue()).toBe(2021);
        });

        /** The trial pages carry a trial citation's charges, so a dropped one locks as it does on the front page. */
        it("writes a dropped violation onto the trial page's violation section and locks its boxes", () => {
            const page = getTrialPage();
            const dropped = page.getDropzone(TrialPageViolationDropzone).onDrop({ code: "56-5-2930", description: "Failure to yield", statute: "56-5-2930", points: 4 });
            const section = service.applyTrialViolationDropzone(page, dropped).getViolationSection();

            expect(section.getSectionNumber().getValue()).toBe("56-5-2930");
            expect(section.getDescription().getValue()).toBe("Failure to yield");
            expect(section.getScPoints().getValue()).toBe(4);
            expect(section.getSectionNumber().getIsEnabled()).toBe(false);
            expect(section.getDescription().getIsEnabled()).toBe(false);
        });
    });
});
